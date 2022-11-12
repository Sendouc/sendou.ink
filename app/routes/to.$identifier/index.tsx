import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useOutletContext } from "@remix-run/react";
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
import { requireUser } from "~/modules/auth";
import type { StageId } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import mapsStyles from "~/styles/maps.css";
import styles from "~/styles/tournament.css";
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
import {
  createTournamentMapList,
  type BracketType,
  type TournamentMaplistInput,
  type TournamentMaplistSource,
} from "~/modules/tournament-map-list-generator";
import type { MapPoolMap } from "~/db/types";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: mapsStyles },
  ];
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

  validate(event.isBeforeStart);

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
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export default function TournamentToolsPage() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <Main>
      {data.event.isBeforeStart ? <PrestartControls /> : <MaplistGenerator />}
    </Main>
  );
}

function PrestartControls() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="stack md">
      <TeamNameSection />
      {data.ownTeam && (
        <>
          <MapPoolSection />
          <RosterSection />
          <div className="tournament__action-side-note">
            Note: you can change your map pool and roster as many times as you
            want before the tournament starts.
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
              Delete team
            </Button>
          </FormWithConfirm>
        </>
      )}
    </div>
  );
}

function TeamNameSection() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <section className="tournament__action-section stack md">
      <div>
        1. Register on{" "}
        <a
          href={data.event.bracketUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.event.bracketUrl}
        </a>
      </div>
      <Details className="bg-darker-transparent rounded">
        <Summary className="bg-transparent-important">
          <div className="tournament__summary-content">
            Enter team name you register with{" "}
            {data.ownTeam ? (
              <CheckmarkIcon className="fill-success" />
            ) : (
              <AlertIcon className="fill-warning" />
            )}
          </div>
        </Summary>
        <Form method="post" className="mt-3 px-2 pb-4">
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
            Submit
          </Button>
        </Form>
      </Details>
    </section>
  );
}

function MapPoolSection() {
  const data = useOutletContext<TournamentToolsLoaderData>();
  const [counterpickMapPool, setCounterpickMapPool] = React.useState(
    data.ownTeam?.mapPool ? new MapPool(data.ownTeam.mapPool) : MapPool.EMPTY
  );

  const hasPickedMapPool = (data.ownTeam?.mapPool.length ?? 0) > 0;

  return (
    <section>
      <Form method="post" className="tournament__action-section stack md">
        <div>
          2. Map pool
          <div className="tournament__action-side-note">
            You can play without selecting a map pool but then your opponent
            gets to decide what maps get played. Tie breaker maps marked in{" "}
            <span className="text-info">blue</span>.
          </div>
        </div>
        <Details className="bg-darker-transparent rounded">
          <Summary className="bg-transparent-important">
            <div className="tournament__summary-content">
              Pick your team&apos;s maps{" "}
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
            noTitle
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
                Save changes
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
  return (
    <section className="tournament__action-section">
      3. Submit roster
      <div className="tournament__action-side-note">
        Submitting roster is optional but you might be seeded lower if you
        don&apos;t.
        <Button className="mt-4">Enter roster</Button>
      </div>
    </section>
  );
}

type TeamInState = {
  id: number;
  mapPool?: Pick<MapPoolMap, "mode" | "stageId">[];
};
function MaplistGenerator() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  // xxx: but inside custom hook using search params
  const [bestOf, setBestOf] = React.useState<3 | 5 | 7>(3);
  const [teamOne, setTeamOne] = React.useState<TeamInState>(
    data.ownTeam ?? data.teams[0]!
  );
  const [teamTwo, setTeamTwo] = React.useState<TeamInState>(data.teams[1]!);
  const [roundNumber, setRoundNumber] = React.useState(1);
  const [bracketType, setBracketType] =
    React.useState<BracketType>("DE_WINNERS");

  const handleSetTeam =
    (setTeam: (newTeam: TeamInState) => void) => (id: number) => {
      setTeam(id === -1 ? { id } : data.teams.find((team) => team.id === id)!);
    };

  return (
    <div className="stack md">
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
          setTeam={handleSetTeam(setTeamOne)}
        />
        <TeamsSelect
          number={2}
          team={teamTwo}
          otherTeam={teamOne}
          setTeam={handleSetTeam(setTeamTwo)}
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
      <label htmlFor="round">Round</label>
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
  team: TeamInState;
  otherTeam: TeamInState;
  setTeam: (newTeamId: number) => void;
}) {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="tournament__select-container">
      <label htmlFor="round">Team {number}</label>
      <select
        id="round"
        className="tournament__team-select"
        value={team.id}
        onChange={(e) => {
          setTeam(Number(e.target.value));
        }}
      >
        {otherTeam.id !== -1 && <option value={-1}>(Unlisted team)</option>}
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

const BEST_OF_OPTIONS = [3, 5, 7] as const;
function BestOfRadios({
  bestOf,
  setBestOf,
}: {
  bestOf: 3 | 5 | 7;
  setBestOf: (bestOf: 3 | 5 | 7) => void;
}) {
  return (
    <div className="tournament__bo-radios-container">
      {BEST_OF_OPTIONS.map((bestOfOption) => (
        <div key={bestOfOption}>
          <label htmlFor={String(bestOfOption)}>Bo{bestOfOption}</label>
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

  const mapList = createTournamentMapList({
    ...props,
    tiebreakerMaps: new MapPool(data.tieBreakerMapPool),
  });

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
  const text = () => {
    if (source === teamOneId) return `Team 1 pick`;
    if (source === teamTwoId) return `Team 2 pick`;
    if (source === "TIEBREAKER") return `Tiebreaker`;
    if (source === "BOTH") return `Both picked`;
    if (source === "DEFAULT") return `Default map`;

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
