import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Alert } from "~/components/Alert";
import type { MapPoolMap } from "~/db/types";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/features/auth/core/user";
import { getUserId } from "~/features/auth/core/user.server";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import type {
  TournamentMapListMap,
  BracketType,
  TournamentMaplistInput,
  TournamentMaplistSource,
} from "~/modules/tournament-map-list-generator";
import { canAdminTournament } from "~/permissions";
import "~/styles/maps.css";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { tournamentPage } from "~/utils/urls";
import { findMapPoolsByTournamentId } from "../queries/findMapPoolsByTournamentId.server";
import { TOURNAMENT } from "../tournament-constants";
import {
  modesIncluded,
  resolveOwnedTeam,
  tournamentIdFromParams,
} from "../tournament-utils";
import type { TournamentLoaderData } from "./to.$id";
import * as TournamentRepository from "../TournamentRepository.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";

export const handle: SendouRouteHandle = {
  i18n: ["tournament"],
};

type TeamInState = {
  id: number;
  mapPool?: Pick<MapPoolMap, "mode" | "stageId">[];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const user = await getUserId(request);
  const tournament = notFoundIfFalsy(
    await TournamentRepository.findById(tournamentId),
  );

  const mapListGeneratorAvailable =
    canAdminTournament({ user, tournament }) || tournament.showMapListGenerator;

  if (!mapListGeneratorAvailable) {
    throw redirect(tournamentPage(tournamentId));
  }

  return {
    mapPools: findMapPoolsByTournamentId(tournamentId),
  };
};

export default function TournamentMapsPage() {
  const user = useUser();
  const { t } = useTranslation(["tournament"]);
  const actionData = useActionData<{ failed?: boolean }>();
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentLoaderData>();

  const [bestOf, setBestOf] = useSearchParamState<
    (typeof TOURNAMENT)["AVAILABLE_BEST_OF"][number]
  >({
    name: "bo",
    defaultValue: 3,
    revive: reviveBestOf,
  });
  const [teamOneId, setTeamOneId] = useSearchParamState({
    name: "team-one",
    defaultValue:
      resolveOwnedTeam({ teams: parentRouteData.teams, userId: user?.id })
        ?.id ?? parentRouteData.teams[0]?.id,
    revive: reviveTeam(parentRouteData.teams.map((t) => t.id)),
  });
  const [teamTwoId, setTeamTwoId] = useSearchParamState({
    name: "team-two",
    defaultValue: parentRouteData.teams[1]?.id,
    revive: reviveTeam(
      parentRouteData.teams.map((t) => t.id),
      teamOneId,
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

  const teamOne = parentRouteData.teams.find((t) => t.id === teamOneId) ?? {
    id: -1,
    mapPool: [],
  };
  const teamTwo = parentRouteData.teams.find((t) => t.id === teamTwoId) ?? {
    id: -1,
    mapPool: [],
  };

  const teamOneMaps =
    data.mapPools.find((mp) => mp.tournamentTeamId === teamOne.id)?.mapPool ??
    [];
  const teamTwoMaps =
    data.mapPools.find((mp) => mp.tournamentTeamId === teamTwo.id)?.mapPool ??
    [];

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
          { ...teamOne, maps: new MapPool(teamOneMaps) },
          { ...teamTwo, maps: new MapPool(teamTwoMaps) },
        ]}
        bestOf={bestOf}
        seed={`${bracketType}-${roundNumber}`}
        modesIncluded={modesIncluded(parentRouteData.tournament)}
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
  roundNumber: number;
  bracketType: string;
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
            string,
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
          }),
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
  const data = useOutletContext<TournamentLoaderData>();

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
        <option value={-1}>({t("tournament:team.unlisted")})</option>
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
  bestOf: (typeof TOURNAMENT)["AVAILABLE_BEST_OF"][number];
  setBestOf: (bestOf: (typeof TOURNAMENT)["AVAILABLE_BEST_OF"][number]) => void;
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
  const data = useOutletContext<TournamentLoaderData>();

  let mapList: Array<TournamentMapListMap>;

  try {
    mapList = createTournamentMapList({
      ...props,
      tiebreakerMaps: new MapPool(data.tournament.tieBreakerMapPool),
    });
  } catch (e) {
    console.error(
      "Failed to create map list. Falling back to default maps.",
      e,
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
      tiebreakerMaps: new MapPool(data.tournament.tieBreakerMapPool),
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
