import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useActionData, useOutletContext } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Details, Summary } from "~/components/DetailsSummary";
import { AlertIcon } from "~/components/icons/Alert";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { MapPoolSelector } from "~/components/MapPoolSelector";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { TOURNAMENT } from "~/constants";
import { db } from "~/db";
import { requireUser, useUser } from "~/modules/auth";
import type { StageId } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import mapsStyles from "~/styles/maps.css";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  type SendouRouteHandle,
  validate,
} from "~/utils/remix";
import { findOwnedTeam } from "~/utils/tournaments";
import { assertUnreachable } from "~/utils/types";
import { modeImageUrl } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "../to.$identifier";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import {
  createTournamentMapList,
  type BracketType,
  type TournamentMaplistInput,
  type TournamentMaplistSource,
} from "~/modules/tournament-map-list-generator";
import type { MapPoolMap } from "~/db/types";
import invariant from "tiny-invariant";
import { UserCombobox } from "~/components/Combobox";
import { TeamWithRoster } from "./components/TeamWithRoster";
import { actualNumber } from "~/utils/zod";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { canAdminCalendarTOTools } from "~/permissions";
import { Toggle } from "~/components/Toggle";
import { Label } from "~/components/Label";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapsStyles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["tournament"],
};

const tournamentToolsActionSchema = z.union([
  z.object({
    _action: z.literal("TEAM_NAME"),
    name: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
  }),
  z.object({
    _action: z.literal("POOL"),
    pool: z.string(),
  }),
  z.object({
    _action: z.literal("DELETE_REGISTRATION"),
  }),
  z.object({
    _action: z.literal("ADD_MEMBER"),
    "user[value]": z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: z.literal("DELETE_MEMBER"),
    id: z.preprocess(actualNumber, z.number().positive()),
  }),
]);

export const action: ActionFunction = async ({ request, params }) => {
  const data = await parseRequestFormData({
    request,
    schema: tournamentToolsActionSchema,
  });
  const user = await requireUser(request);

  const event = badRequestIfFalsy(
    db.tournaments.findByIdentifier(params["identifier"]!)
  );
  const teams = db.tournaments.findTeamsByEventId(event.id);
  const ownTeam = findOwnedTeam({ userId: user.id, teams });

  if (!event.isBeforeStart) {
    return { failed: true };
  }

  switch (data._action) {
    case "TEAM_NAME": {
      if (ownTeam) {
        db.tournaments.renameTeam({
          id: ownTeam.id,
          name: data.name,
        });
      } else {
        db.tournaments.addTeam({
          ownerId: user.id,
          name: data.name,
          calendarEventId: event.id,
        });
      }
      break;
    }
    case "POOL": {
      validate(ownTeam);
      const mapPool = new MapPool(data.pool);
      validate(validateCounterPickMapPool(mapPool) === "VALID");

      db.tournaments.upsertCounterpickMaps({
        mapPool,
        tournamentTeamId: ownTeam.id,
      });
      break;
    }
    case "DELETE_REGISTRATION": {
      validate(ownTeam);
      db.tournaments.deleteTournamentTeam(ownTeam.id);
      break;
    }
    case "ADD_MEMBER": {
      validate(ownTeam);
      validate(ownTeam.members.length < TOURNAMENT.TEAM_MAX_MEMBERS);
      db.tournaments.addTeamMember({
        userId: data["user[value]"],
        tournamentTeamId: ownTeam.id,
      });
      break;
    }
    case "DELETE_MEMBER": {
      validate(ownTeam);
      validate(data.id !== user.id);
      db.tournaments.deleteTeamMember({
        userId: data.id,
        tournamentTeamId: ownTeam.id,
      });
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export default function TournamentToolsPage() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useOutletContext<TournamentToolsLoaderData>();
  const [showGenerator, setShowGenerator] = React.useState(
    !data.event.isBeforeStart
  );

  return (
    <Main className="stack lg">
      {canAdminCalendarTOTools({ user, event: data.event }) &&
      data.event.isBeforeStart ? (
        <div className="stack horizontal md items-center">
          <Toggle checked={showGenerator} setChecked={setShowGenerator} />
          <Label>{t("tournament:preview")}</Label>
        </div>
      ) : null}
      <div>{showGenerator ? <MaplistGenerator /> : <PrestartControls />}</div>
    </Main>
  );
}

function PrestartControls() {
  const { t } = useTranslation(["tournament"]);
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="stack md">
      <TeamNameSection />
      {data.ownTeam && (
        <>
          <MapPoolSection />
          <RosterSection />
          <div className="tournament__action-side-note">
            {t("tournament:pre.footerNote")}
          </div>
          <FormWithConfirm
            fields={[["_action", "DELETE_REGISTRATION"]]}
            dialogHeading={`Delete data related to ${data.ownTeam.name}?`}
          >
            <Button
              tiny
              variant="minimal-destructive"
              type="submit"
              className="mt-4"
            >
              {t("tournament:pre.deleteTeam")}
            </Button>
          </FormWithConfirm>
        </>
      )}
    </div>
  );
}

function TeamNameSection() {
  const { t } = useTranslation(["tournament", "common"]);
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <section className="tournament__action-section stack md">
      <div>
        <span className="tournament__action-section-title">
          {t("tournament:pre.steps.register")}{" "}
          <a
            href={data.event.bracketUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.event.bracketUrl}
          </a>
        </span>
      </div>
      <Details className="bg-darker-transparent rounded">
        <Summary className="bg-transparent-important">
          <div className="tournament__summary-content">
            {t("tournament:pre.steps.register.summary")}{" "}
            {data.ownTeam ? (
              <CheckmarkIcon className="fill-success" />
            ) : (
              <AlertIcon className="fill-warning" />
            )}
          </div>
        </Summary>
        <Form method="post" className="mt-3 px-4 pb-4">
          <input
            id="name"
            name="name"
            maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
            defaultValue={data.ownTeam?.name}
            required
          />
          <Button
            tiny
            className="mt-4"
            name="_action"
            value="TEAM_NAME"
            type="submit"
          >
            {t("common:actions.submit")}
          </Button>
        </Form>
      </Details>
    </section>
  );
}

function MapPoolSection() {
  const { t } = useTranslation(["tournament", "common"]);
  const data = useOutletContext<TournamentToolsLoaderData>();
  const [counterpickMapPool, setCounterpickMapPool] = React.useState(
    data.ownTeam?.mapPool ? new MapPool(data.ownTeam.mapPool) : MapPool.EMPTY
  );

  const hasPickedMapPool = (data.ownTeam?.mapPool.length ?? 0) > 0;

  return (
    <section>
      <Form method="post" className="tournament__action-section stack md">
        <div>
          <span className="tournament__action-section-title">
            {t("tournament:pre.steps.mapPool")}
          </span>
          <div className="tournament__action-side-note">
            {t("tournament:pre.steps.mapPool.explanation")}
          </div>
        </div>
        <Details className="bg-darker-transparent rounded">
          <Summary className="bg-transparent-important">
            <div className="tournament__summary-content">
              {t("tournament:pre.steps.mapPool.summary")}{" "}
              {hasPickedMapPool ? (
                <CheckmarkIcon className="fill-success" />
              ) : (
                <AlertIcon className="fill-warning" />
              )}
            </div>
          </Summary>
          <RequiredHiddenInput
            value={counterpickMapPool.serialized}
            name="pool"
            isValid={validateCounterPickMapPool(counterpickMapPool) === "VALID"}
          />
          <MapPoolSelector
            mapPool={counterpickMapPool}
            handleMapPoolChange={setCounterpickMapPool}
            className="bg-transparent-important"
            modesToInclude={["SZ", "TC", "RM", "CB"]}
            preselectedMapPool={new MapPool(data.tieBreakerMapPool)}
            info={
              <div className="stack md mt-2">
                <MapPoolCounts mapPool={counterpickMapPool} />
                <MapPoolValidationStatusMessage
                  status={validateCounterPickMapPool(counterpickMapPool)}
                />
              </div>
            }
            footer={
              <Button
                type="submit"
                className="mt-4 w-max mx-auto"
                name="_action"
                value="POOL"
                tiny
              >
                {t("common:actions.saveChanges")}
              </Button>
            }
          />
        </Details>
      </Form>
    </section>
  );
}

type CounterPickValidationStatus =
  | "PICKING"
  | "VALID"
  | "TOO_MUCH_STAGE_REPEAT";

function validateCounterPickMapPool(
  mapPool: MapPool
): CounterPickValidationStatus {
  const stageCounts = new Map<StageId, number>();
  for (const stageId of mapPool.stages) {
    if (!stageCounts.has(stageId)) {
      stageCounts.set(stageId, 0);
    }
    if (stageCounts.get(stageId)! === TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT) {
      return "TOO_MUCH_STAGE_REPEAT";
    }

    stageCounts.set(stageId, stageCounts.get(stageId)! + 1);
  }

  if (
    mapPool.parsed.SZ.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.TC.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.RM.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.CB.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE
  ) {
    return "PICKING";
  }

  return "VALID";
}

function MapPoolValidationStatusMessage({
  status,
}: {
  status: CounterPickValidationStatus;
}) {
  const { t } = useTranslation(["common"]);

  if (status !== "TOO_MUCH_STAGE_REPEAT") return null;

  return (
    <div>
      <Alert alertClassName="w-max" variation="WARNING" tiny>
        {t(`common:maps.validation.${status}`, {
          maxStageRepeat: TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT,
        })}
      </Alert>
    </div>
  );
}

function MapPoolCounts({ mapPool }: { mapPool: MapPool }) {
  const { t } = useTranslation(["game-misc"]);

  return (
    <div className="tournament__map-pool-counts">
      {rankedModesShort.map((mode) => (
        <Image
          key={mode}
          title={t(`game-misc:MODE_LONG_${mode}`)}
          alt={t(`game-misc:MODE_LONG_${mode}`)}
          path={modeImageUrl(mode)}
          width={24}
          height={24}
        />
      ))}
      {rankedModesShort.map((mode) => {
        const currentLen = mapPool.parsed[mode].length;
        const targetLen = TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;

        return (
          <div
            key={mode}
            className={clsx("tournament__map-pool-count", {
              "text-success": currentLen === targetLen,
              "text-error": currentLen > targetLen,
            })}
          >
            {currentLen}/{targetLen}
          </div>
        );
      })}
    </div>
  );
}

function RosterSection() {
  const { t } = useTranslation(["tournament", "common"]);
  const data = useOutletContext<TournamentToolsLoaderData>();
  invariant(data.ownTeam);

  const hasCompleteTeam =
    data.ownTeam.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL;
  const hasSpaceInTeam =
    data.ownTeam.members.length < TOURNAMENT.TEAM_MAX_MEMBERS;

  return (
    <section className="tournament__action-section stack md">
      <div>
        <span className="tournament__action-section-title">
          {t("tournament:pre.steps.roster")}
        </span>
        <div className="tournament__action-side-note">
          {t("tournament:pre.steps.roster.explanation")}
        </div>
      </div>
      <Details className="bg-darker-transparent rounded">
        <Summary className="bg-transparent-important">
          <div className="tournament__summary-content">
            {t("tournament:pre.steps.roster.summary")}{" "}
            {hasCompleteTeam ? (
              <CheckmarkIcon className="fill-success" />
            ) : (
              <AlertIcon className="fill-warning" />
            )}
          </div>
        </Summary>
        <div className="stack lg items-center px-2 py-4">
          {hasSpaceInTeam ? (
            <Form method="post" className="stack horizontal sm items-center">
              <UserCombobox
                inputName="user"
                required
                userIdsToOmit={
                  new Set(data.ownTeam.members.map((m) => m.userId))
                }
                key={data.ownTeam.members.length}
              />
              <Button tiny type="submit" name="_action" value="ADD_MEMBER">
                {t("common:actions.add")}
              </Button>
            </Form>
          ) : (
            <div className="text-xs text-lighter">
              {t("tournament:pre.steps.roster.fullTeamError")}
            </div>
          )}

          <Form method="post" className="w-full">
            <input type="hidden" name="_action" value="DELETE_MEMBER" />
            <TeamWithRoster team={data.ownTeam} showDeleteButtons />
          </Form>
        </div>
      </Details>
    </section>
  );
}

type TeamInState = {
  id: number;
  mapPool?: Pick<MapPoolMap, "mode" | "stageId">[];
};
function MaplistGenerator() {
  const { t } = useTranslation(["tournament"]);
  const actionData = useActionData<{ failed?: boolean }>();
  const data = useOutletContext<TournamentToolsLoaderData>();

  const [bestOf, setBestOf] = useSearchParamState<
    typeof TOURNAMENT["AVAILABLE_BEST_OF"][number]
  >({
    name: "bo",
    defaultValue: 3,
    revive: reviveBestOf,
  });
  const [teamOneId, setTeamOneId] = useSearchParamState({
    name: "team-one",
    defaultValue: data.ownTeam?.id ?? data.teams[0]!.id,
    revive: reviveTeam(data.teams.map((t) => t.id)),
  });
  const [teamTwoId, setTeamTwoId] = useSearchParamState({
    name: "team-two",
    defaultValue: data.teams[1]!.id,
    revive: reviveTeam(
      data.teams.map((t) => t.id),
      teamOneId
    ),
  });
  const [roundNumber, setRoundNumber] = useSearchParamState({
    name: "round",
    defaultValue: 1,
    revive: reviveRound,
  });
  const [bracketType, setBracketType] = useSearchParamState<BracketType>({
    name: "bracket",
    defaultValue: "DE_WINNERS",
    revive: reviveBracketType,
  });

  const teamOne = data.teams.find((t) => t.id === teamOneId) ?? {
    id: -1,
    mapPool: [],
  };
  const teamTwo = data.teams.find((t) => t.id === teamTwoId) ?? {
    id: -1,
    mapPool: [],
  };

  return (
    <div className="stack md">
      {actionData?.failed && (
        <Alert variation="ERROR" tiny>
          {t("tournament:generator.error")}
        </Alert>
      )}
      <RoundSelect
        roundNumber={roundNumber}
        bracketType={bracketType}
        handleChange={(roundNumber, bracketType) => {
          setRoundNumber(roundNumber);
          setBracketType(bracketType);
        }}
      />
      <div className="tournament__teams-container">
        <TeamsSelect
          number={1}
          team={teamOne}
          otherTeam={teamTwo}
          setTeam={setTeamOneId}
        />
        <TeamsSelect
          number={2}
          team={teamTwo}
          otherTeam={teamOne}
          setTeam={setTeamTwoId}
        />
      </div>
      <BestOfRadios bestOf={bestOf} setBestOf={setBestOf} />
      <MapList
        teams={[
          { ...teamOne, maps: new MapPool(teamOne.mapPool ?? []) },
          { ...teamTwo, maps: new MapPool(teamTwo.mapPool ?? []) },
        ]}
        bestOf={bestOf}
        bracketType={bracketType}
        roundNumber={roundNumber}
      />
    </div>
  );
}

const BRACKET_TYPES: Array<BracketType> = ["DE_WINNERS", "DE_LOSERS"];
const AMOUNT_OF_ROUNDS = 12;

function reviveBestOf(value: string) {
  const parsed = Number(value);

  return TOURNAMENT.AVAILABLE_BEST_OF.find((bo) => bo === parsed);
}

function reviveBracketType(value: string) {
  return BRACKET_TYPES.find((bracketType) => bracketType === value);
}

function reviveRound(value: string) {
  const parsed = Number(value);

  return new Array(AMOUNT_OF_ROUNDS)
    .fill(null)
    .map((_, i) => i + 1)
    .find((val) => val === parsed);
}

function reviveTeam(teamIds: number[], excludedTeamId?: number) {
  return function (value: string) {
    const parsed = Number(value);

    return teamIds
      .filter((id) => id !== excludedTeamId)
      .find((id) => id === parsed);
  };
}

function RoundSelect({
  roundNumber,
  bracketType,
  handleChange,
}: {
  roundNumber: TournamentMaplistInput["roundNumber"];
  bracketType: TournamentMaplistInput["bracketType"];
  handleChange: (roundNumber: number, bracketType: BracketType) => void;
}) {
  const { t } = useTranslation(["tournament"]);

  return (
    <div className="tournament__round-container tournament__select-container">
      <label htmlFor="round">{t("tournament:round.label")}</label>
      <select
        id="round"
        value={`${bracketType}-${roundNumber}`}
        onChange={(e) => {
          const [bracketType, roundNumber] = e.target.value.split("-") as [
            BracketType,
            string
          ];
          handleChange(Number(roundNumber), bracketType);
        }}
      >
        {BRACKET_TYPES.flatMap((type) =>
          new Array(AMOUNT_OF_ROUNDS).fill(null).map((_, i) => {
            return (
              <option key={`${type}-${i}`} value={`${type}-${i + 1}`}>
                {t(`tournament:bracket.type.${type}`)} {i + 1}
              </option>
            );
          })
        )}
      </select>
    </div>
  );
}

function TeamsSelect({
  number,
  team,
  otherTeam,
  setTeam,
}: {
  number: number;
  team: { id: number };
  otherTeam: TeamInState;
  setTeam: (newTeamId: number) => void;
}) {
  const { t } = useTranslation(["tournament"]);
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="tournament__select-container">
      <label htmlFor="round">
        {t("tournament:team.label")} {number}
      </label>
      <select
        id="round"
        className="tournament__team-select"
        value={team.id}
        onChange={(e) => {
          setTeam(Number(e.target.value));
        }}
      >
        {otherTeam.id !== -1 && (
          <option value={-1}>({t("tournament:team.unlisted")})</option>
        )}
        {data.teams
          .filter((t) => t.id !== otherTeam.id)
          .map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
      </select>
    </div>
  );
}

function BestOfRadios({
  bestOf,
  setBestOf,
}: {
  bestOf: typeof TOURNAMENT["AVAILABLE_BEST_OF"][number];
  setBestOf: (bestOf: typeof TOURNAMENT["AVAILABLE_BEST_OF"][number]) => void;
}) {
  const { t } = useTranslation(["tournament"]);

  return (
    <div className="tournament__bo-radios-container">
      {TOURNAMENT.AVAILABLE_BEST_OF.map((bestOfOption) => (
        <div key={bestOfOption}>
          <label htmlFor={String(bestOfOption)}>
            {t("tournament:bestOf.label.short")}
            {bestOfOption}
          </label>
          <input
            id={String(bestOfOption)}
            name="bestOf"
            type="radio"
            checked={bestOfOption === bestOf}
            onChange={() => setBestOf(bestOfOption)}
          />
        </div>
      ))}
    </div>
  );
}

function MapList(props: Omit<TournamentMaplistInput, "tiebreakerMaps">) {
  const { t } = useTranslation(["game-misc"]);
  const data = useOutletContext<TournamentToolsLoaderData>();

  let mapList: Array<TournamentMapListMap>;

  try {
    mapList = createTournamentMapList({
      ...props,
      tiebreakerMaps: new MapPool(data.tieBreakerMapPool),
    });
  } catch (e) {
    console.error(
      "Failed to create map list. Falling back to default maps.",
      e
    );

    mapList = createTournamentMapList({
      ...props,
      teams: [
        {
          id: -1,
          maps: new MapPool([]),
        },
        {
          id: -2,
          maps: new MapPool([]),
        },
      ],
      tiebreakerMaps: new MapPool(data.tieBreakerMapPool),
    });
  }

  return (
    <div className="tournament__map-list">
      {mapList.map(({ stageId, mode, source }, i) => {
        return (
          <React.Fragment key={`${stageId}-${mode}`}>
            <PickInfoText
              source={source}
              teamOneId={props.teams[0].id}
              teamTwoId={props.teams[1].id}
            />
            <div key={stageId} className="tournament__stage-listed">
              {i + 1}) {mode} {t(`game-misc:STAGE_${stageId}`)}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PickInfoText({
  source,
  teamOneId,
  teamTwoId,
}: {
  source: TournamentMaplistSource;
  teamOneId: number;
  teamTwoId: number;
}) {
  const { t } = useTranslation(["tournament"]);

  const text = () => {
    if (source === teamOneId)
      return t("tournament:pickInfo.team", { number: 1 });
    if (source === teamTwoId)
      return t("tournament:pickInfo.team", { number: 2 });
    if (source === "TIEBREAKER") return t("tournament:pickInfo.tiebreaker");
    if (source === "BOTH") return t("tournament:pickInfo.both");
    if (source === "DEFAULT") return t("tournament:pickInfo.default");

    console.error(`Unknown source: ${String(source)}`);
    return "";
  };

  const otherClassName = () => {
    if (source === teamOneId) return "team-1";
    if (source === teamTwoId) return "team-2";
    return typeof source === "string" ? source.toLocaleLowerCase() : source;
  };

  return (
    <div className={clsx("tournament__pick-info", otherClassName())}>
      {text()}
    </div>
  );
}
