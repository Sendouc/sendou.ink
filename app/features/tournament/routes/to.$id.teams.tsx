import { Link, useOutletContext } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { userPage } from "~/utils/urls";
import type { FindTeamsByTournamentIdItem } from "../queries/findTeamsByTournamentId.server";
import { TOURNAMENT } from "../tournament-constants";
import type { TournamentLoaderData, TournamentLoaderTeam } from "./to.$id";

export default function TournamentTeamsPage() {
  const data = useOutletContext<TournamentLoaderData>();

  return (
    <div className="stack lg">
      {data.teams
        .slice()
        .sort(fullTeamAndHigherPlusStatusOnTop)
        .map((team) => {
          return <TeamWithRoster key={team.id} team={team} />;
        })}
    </div>
  );
}

function TeamWithRoster({
  team,
}: {
  team: Pick<FindTeamsByTournamentIdItem, "members" | "name">;
}) {
  return (
    <div className="tournament__team-with-roster">
      <div className="tournament__team-with-roster__name">{team.name}</div>
      <ul className="tournament__team-with-roster__members">
        {team.members.map((member) => (
          <li
            key={member.userId}
            className="tournament__team-with-roster__member"
          >
            <Avatar user={member} size="xxs" />
            <Link
              to={userPage(member)}
              className="tournament__team-member-name"
            >
              {member.discordName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fullTeamAndHigherPlusStatusOnTop(
  teamA: TournamentLoaderTeam,
  teamB: TournamentLoaderTeam
) {
  if (
    teamA.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL &&
    teamB.members.length < TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL
  ) {
    return -1;
  }

  if (
    teamA.members.length < TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL &&
    teamB.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL
  ) {
    return 1;
  }

  const lowestATeamPlusTier = Math.min(
    ...teamA.members.map((m) => m.plusTier ?? Infinity)
  );
  const lowestBTeamPlusTier = Math.min(
    ...teamB.members.map((m) => m.plusTier ?? Infinity)
  );

  if (lowestATeamPlusTier > lowestBTeamPlusTier) {
    return 1;
  }

  if (lowestATeamPlusTier < lowestBTeamPlusTier) {
    return -1;
  }

  return 0;
}
