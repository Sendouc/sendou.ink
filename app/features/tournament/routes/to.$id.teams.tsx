import { Link, useOutletContext } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { AlertIcon } from "~/components/icons/Alert";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { Image } from "~/components/Image";
import { useTranslation } from "~/hooks/useTranslation";
import { navIconUrl, userPage } from "~/utils/urls";
import type { FindTeamsByEventIdItem } from "../queries/findTeamsByEventId.server";
import { TOURNAMENT } from "../tournament-constants";
import type { TournamentToolsLoaderData, TournamentToolsTeam } from "./to.$id";

export default function TournamentToolsTeamsPage() {
  const { t } = useTranslation(["tournament"]);
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="stack lg">
      {data.teams
        .slice()
        .sort(fullTeamAndHigherPlusStatusOnTop)
        .map((team) => {
          const hasMapPool = () => {
            // before start empty array is returned if team has map list
            // after start empty array means team has no map list
            if (data.event.isBeforeStart) {
              return Boolean(team.mapPool);
            }

            return team.mapPool && team.mapPool.length > 0;
          };

          return (
            <div key={team.id} className="stack sm items-center">
              <div className="tournament__pick-status-container">
                <Image
                  path={navIconUrl("maps")}
                  alt={t("tournament:teams.mapsPickedStatus")}
                  title={t("tournament:teams.mapsPickedStatus")}
                  height={16}
                  width={16}
                />
                {hasMapPool() ? (
                  <CheckmarkIcon className="fill-success" />
                ) : (
                  <AlertIcon className="fill-warning" />
                )}
              </div>
              <TeamWithRoster team={team} />
            </div>
          );
        })}
    </div>
  );
}

function TeamWithRoster({
  team,
}: {
  team: Pick<FindTeamsByEventIdItem, "members" | "name">;
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
  teamA: TournamentToolsTeam,
  teamB: TournamentToolsTeam
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
