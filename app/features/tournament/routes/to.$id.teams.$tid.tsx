import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import invariant from "tiny-invariant";
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
import { ModeImage } from "~/components/Image";
import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import {
  tournamentMatchPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import { useTranslation } from "~/hooks/useTranslation";

export const loader = ({ params }: LoaderArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const tournamentTeamId = tournamentTeamIdFromParams(params);

  // xxx: Handle redirect 404
  // xxx: no links and redirect if tournament didn't start yet

  const manager = getTournamentManager("SQL");
  const bracket = manager.get.tournamentData(tournamentId);
  const _everyMatchIsOver = everyMatchIsOver(bracket);
  const placement = _everyMatchIsOver
    ? finalStandingOfTeam({ manager, tournamentId, tournamentTeamId })
    : null;

  const sets = tournamentTeamSets({ tournamentTeamId, tournamentId });

  return {
    tournamentTeamId,
    placement,
    sets,
    winCounts: winCounts(sets),
  };
};

// xxx: mode icons popup stage too + source
// TODO: could cache this after tournament is finalized
export default function TournamentTeamPage() {
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const teamIndex = parentRouteData.teams.findIndex(
    (t) => t.id === data.tournamentTeamId
  );
  const team = parentRouteData.teams[teamIndex];
  invariant(team, "Team not found");

  // xxx: grey out players who did not play yet
  return (
    <div className="stack lg">
      <TeamWithRoster team={team} />
      <StatSquares
        seed={teamIndex + 1}
        teamsCount={parentRouteData.teams.length}
      />
      <div className="tournament__team__sets">
        {data.sets.map((set) => {
          return <SetInfo key={set.tournamentMatchId} set={set} />;
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
  const data = useLoaderData<typeof loader>();

  return (
    <div className="tournament__team__stats">
      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Set wins</div>
        <div className="tournament__team__stat__main">
          {data.winCounts.sets.won} / {data.winCounts.sets.total}
        </div>
        <div className="tournament__team__stat__sub">
          {data.winCounts.sets.percentage}%
        </div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Map wins</div>
        <div className="tournament__team__stat__main">
          {data.winCounts.maps.won} / {data.winCounts.maps.total}
        </div>
        <div className="tournament__team__stat__sub">
          {data.winCounts.maps.percentage}%
        </div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Seed</div>
        <div className="tournament__team__stat__main">{seed}</div>
        <div className="tournament__team__stat__sub">out of {teamsCount}</div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Placement</div>
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

// xxx: mobile UI
function SetInfo({ set }: { set: PlayedSet }) {
  const { t } = useTranslation(["tournament"]);
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  return (
    <div className="tournament__team__set">
      <div className="stack horizontal sm items-end justify-center">
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
          {set.maps.map(({ modeShort, result }, i) => {
            return (
              <ModeImage
                key={i}
                mode={modeShort}
                size={20}
                containerClassName={clsx("tournament__team__set__mode", {
                  tournament__team__set__mode__loss: result === "loss",
                })}
              />
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
