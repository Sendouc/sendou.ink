import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { Placement } from "~/components/Placement";
import {
  everyMatchIsOver,
  finalStandingOfTeam,
  getTournamentManager,
} from "~/features/tournament-bracket";
import { TeamWithRoster } from "../components/TeamWithRoster";
import {
  type PlayedSet,
  tournamentTeamSets,
  winCounts,
} from "../core/sets.server";
import {
  tournamentIdFromParams,
  tournamentRoundI18nKey,
  tournamentTeamIdFromParams,
} from "../tournament-utils";
import type { TournamentLoaderData } from "./to.$id";
import { ModeImage, StageImage } from "~/components/Image";
import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import {
  tournamentMatchPage,
  tournamentPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import { useTranslation } from "~/hooks/useTranslation";
import { Redirect } from "~/components/Redirect";
import { Popover } from "~/components/Popover";
import type { TournamentMaplistSource } from "~/modules/tournament-map-list-generator";
import type { FindTeamsByTournamentIdItem } from "../queries/findTeamsByTournamentId.server";
import { findMapPoolByTeamId } from "~/features/tournament-bracket";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import invariant from "tiny-invariant";

export const loader = ({ params }: LoaderArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const tournamentTeamId = tournamentTeamIdFromParams(params);

  const manager = getTournamentManager("SQL");

  const bracket = manager.get.tournamentData(tournamentId);
  invariant(
    bracket.stage.length === 1,
    "Bracket doesn't have exactly one stage"
  );
  const stage = bracket.stage[0];

  const _everyMatchIsOver = everyMatchIsOver(bracket);
  const standing = _everyMatchIsOver
    ? finalStandingOfTeam({
        manager,
        tournamentId,
        tournamentTeamId,
        stageId: stage.id,
      })
    : null;

  const sets = tournamentTeamSets({ tournamentTeamId, tournamentId });
  const revealMapPool = hasTournamentStarted(tournamentId);

  return {
    tournamentTeamId,
    mapPool: revealMapPool ? findMapPoolByTeamId(tournamentTeamId) : null,
    placement: standing?.placement,
    sets,
    winCounts: winCounts(sets),
    playersThatPlayed: standing?.players.map((p) => p.id),
  };
};

// TODO: could cache this after tournament is finalized
export default function TournamentTeamPage() {
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const teamIndex = parentRouteData.teams.findIndex(
    (t) => t.id === data.tournamentTeamId
  );
  const team = parentRouteData.teams[teamIndex];
  if (!team) {
    return <Redirect to={tournamentPage(parentRouteData.event.id)} />;
  }

  return (
    <div className="stack lg">
      <TeamWithRoster
        team={team}
        mapPool={data.mapPool}
        activePlayers={data.playersThatPlayed}
      />
      {data.winCounts.sets.total > 0 ? (
        <StatSquares
          seed={teamIndex + 1}
          teamsCount={parentRouteData.teams.length}
        />
      ) : null}
      <div className="tournament__team__sets">
        {data.sets.map((set) => {
          return <SetInfo key={set.tournamentMatchId} set={set} team={team} />;
        })}
      </div>
    </div>
  );
}

function StatSquares({
  seed,
  teamsCount,
}: {
  seed: number;
  teamsCount: number;
}) {
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();

  return (
    <div className="tournament__team__stats">
      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">
          {t("tournament:team.setWins")}
        </div>
        <div className="tournament__team__stat__main">
          {data.winCounts.sets.won} / {data.winCounts.sets.total}
        </div>
        <div className="tournament__team__stat__sub">
          {data.winCounts.sets.percentage}%
        </div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">
          {t("tournament:team.mapWins")}
        </div>
        <div className="tournament__team__stat__main">
          {data.winCounts.maps.won} / {data.winCounts.maps.total}
        </div>
        <div className="tournament__team__stat__sub">
          {data.winCounts.maps.percentage}%
        </div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">
          {t("tournament:team.seed")}
        </div>
        <div className="tournament__team__stat__main">{seed}</div>
        <div className="tournament__team__stat__sub">
          {t("tournament:team.seed.footer", { count: teamsCount })}
        </div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">
          {t("tournament:team.placement")}
        </div>
        <div className="tournament__team__stat__main">
          {data.placement ? (
            <Placement placement={data.placement} textOnly />
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}

function SetInfo({
  set,
  team,
}: {
  set: PlayedSet;
  team: FindTeamsByTournamentIdItem;
}) {
  const { t } = useTranslation(["tournament"]);
  const parentRouteData = useOutletContext<TournamentLoaderData>();

  const sourceToText = (source: TournamentMaplistSource) => {
    switch (source) {
      case "BOTH":
        return t("tournament:pickInfo.both");
      case "DEFAULT":
        return t("tournament:pickInfo.default");
      case "TIEBREAKER":
        return t("tournament:pickInfo.tiebreaker");
      default: {
        const teamName =
          source === set.opponent.id ? set.opponent.name : team.name;

        return t("tournament:pickInfo.team.specific", { team: teamName });
      }
    }
  };

  return (
    <div className="tournament__team__set">
      <div className="tournament__team__set__top-container">
        <div className="tournament__team__set__score">
          {set.score.join("-")}
        </div>
        <Link
          to={tournamentMatchPage({
            matchId: set.tournamentMatchId,
            eventId: parentRouteData.event.id,
          })}
          className="tournament__team__set__round-name"
        >
          {t(`tournament:${tournamentRoundI18nKey(set.round)}`, {
            round: set.round.round,
          })}{" "}
          - {t(`tournament:bracket.${set.bracket}`)}
        </Link>
      </div>
      <div className="overlap-divider">
        <div className="stack horizontal sm">
          {set.maps.map(({ stageId, modeShort, result, source }, i) => {
            return (
              <Popover
                key={i}
                buttonChildren={
                  <ModeImage
                    mode={modeShort}
                    size={20}
                    containerClassName={clsx("tournament__team__set__mode", {
                      tournament__team__set__mode__loss: result === "loss",
                    })}
                  />
                }
                placement="top"
              >
                <div className="tournament__team__set__stage-container">
                  <StageImage
                    stageId={stageId}
                    width={125}
                    className="rounded-sm"
                  />
                  {sourceToText(source)}
                </div>
              </Popover>
            );
          })}
        </div>
      </div>
      <div className="tournament__team__set__opponent">
        <div className="tournament__team__set__opponent__vs">vs.</div>
        <Link
          to={tournamentTeamPage({
            tournamentTeamId: set.opponent.id,
            eventId: parentRouteData.event.id,
          })}
          className="tournament__team__set__opponent__team"
        >
          {set.opponent.name}
        </Link>
        <div className="tournament__team__set__opponent__members">
          {set.opponent.roster.map((user) => {
            return (
              <Link
                to={userPage(user)}
                key={user.id}
                className="tournament__team__set__opponent__member"
              >
                <Avatar user={user} size="xxs" />
                {user.discordName}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
