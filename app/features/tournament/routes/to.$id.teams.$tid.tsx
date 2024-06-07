import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { ModeImage, StageImage } from "~/components/Image";
import { Placement } from "~/components/Placement";
import { Popover } from "~/components/Popover";
import { Redirect } from "~/components/Redirect";
import type { TournamentDataTeam } from "~/features/tournament-bracket/core/Tournament.server";
import type { TournamentMaplistSource } from "~/modules/tournament-map-list-generator";
import {
  teamPage,
  tournamentMatchPage,
  tournamentPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import { TeamWithRoster } from "../components/TeamWithRoster";
import {
  tournamentTeamSets,
  winCounts,
  type PlayedSet,
} from "../core/sets.server";
import {
  tournamentIdFromParams,
  tournamentRoundI18nKey,
  tournamentTeamIdFromParams,
} from "../tournament-utils";
import { useTournament } from "./to.$id";

export const loader = ({ params }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const tournamentTeamId = tournamentTeamIdFromParams(params);

  const sets = tournamentTeamSets({ tournamentTeamId, tournamentId });

  return {
    tournamentTeamId,
    sets,
    // TODO: could be inferred from tournament data
    winCounts: winCounts(sets),
  };
};

// xxx: show IGN

export default function TournamentTeamPage() {
  const data = useLoaderData<typeof loader>();
  const tournament = useTournament();
  const teamIndex = tournament.ctx.teams.findIndex(
    (t) => t.id === data.tournamentTeamId,
  );
  const team = tournament.teamById(data.tournamentTeamId);
  if (!team) {
    return <Redirect to={tournamentPage(tournament.ctx.id)} />;
  }

  return (
    <div className="stack lg">
      <div className="stack sm">
        <TeamWithRoster
          team={team}
          mapPool={team.mapPool}
          activePlayers={
            data.sets.length > 0
              ? tournament
                  .participatedPlayersByTeamId(team.id)
                  .map((p) => p.userId)
              : undefined
          }
        />
        {team.team && !team.team.deletedAt ? (
          <Link
            to={teamPage(team.team.customUrl)}
            className="text-xxs text-center"
          >
            Team page
          </Link>
        ) : null}
      </div>
      {data.winCounts.sets.total > 0 ? (
        <StatSquares
          seed={teamIndex + 1}
          teamsCount={tournament.ctx.teams.length}
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
  const tournament = useTournament();

  const placement = tournament.standings.find(
    (s) => s.team.id === data.tournamentTeamId,
  )?.placement;

  const undergroundBracket = tournament.brackets.find((b) => b.isUnderground);
  const undergroundPlacement = undergroundBracket?.standings.find(
    (s) => s.team.id === data.tournamentTeamId,
  )?.placement;

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
          {placement ? <Placement placement={placement} textOnly /> : "-"}
          {undergroundPlacement ? (
            <>
              {" "}
              / <Placement placement={undergroundPlacement} textOnly />
            </>
          ) : null}
        </div>
        {undergroundPlacement ? (
          <div className="tournament__team__stat__sub">
            {t("tournament:team.placement.footer")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SetInfo({ set, team }: { set: PlayedSet; team: TournamentDataTeam }) {
  const { t } = useTranslation(["tournament"]);
  const tournament = useTournament();

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
            tournamentId: tournament.ctx.id,
          })}
          className="tournament__team__set__round-name"
        >
          {t(`tournament:${tournamentRoundI18nKey(set.round)}`, {
            round: set.round.round,
          })}{" "}
          - {set.stageName}
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
            tournamentId: tournament.ctx.id,
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
                {user.username}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
