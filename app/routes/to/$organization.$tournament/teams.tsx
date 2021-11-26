import { useMatches, LinksFunction } from "remix";
import { FindTournamentByNameForUrlI } from "../../../../services/tournament";
import stylesUrl from "~/styles/teams.css";
import { Fragment } from "react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function TeamsTab() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;

  if (!teams.length) return null;

  const sortedTeams = teams
    // TODO: user id here
    .sort(sortOwnTeamsAndFullTeamsFirst(-1))
    .map((team) => {
      return {
        ...team,
        members: team.members.sort(sortCaptainFirst),
      };
    });

  return (
    <div className="teams-tab">
      <div>
        <div className="teams-tab__teams-container">
          {sortedTeams.map((team) => (
            <Fragment key={team.id}>
              <div className="teams-tab__team-name">{team.name}</div>
              <div className="teams-tab__members-container">
                {team.members.map(({ member, captain }, i) => (
                  <div key={member.id} className="teams-tab__member">
                    <div className="teams-tab__member__order-number">
                      {captain ? "C" : i + 1}
                    </div>
                    <div className="teams-tab__member__container">
                      <div className="teams-tab__member__placeholder">
                        {member.discordAvatar && (
                          <img
                            alt=""
                            className="teams-tab__member__avatar"
                            loading="lazy"
                            src={`https://cdn.discordapp.com/avatars/${member.discordId}/${member.discordAvatar}.png?size=80`}
                          />
                        )}
                      </div>
                      <div>{member.discordName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function sortCaptainFirst(a: { captain: boolean }, b: { captain: boolean }) {
  return Number(b.captain) - Number(a.captain);
}

function sortOwnTeamsAndFullTeamsFirst(userId?: number) {
  return function (
    a: { members: { member: { id: number } }[] },
    b: { members: { member: { id: number } }[] }
  ) {
    if (userId) {
      const aSortValue = Number(
        a.members.some(({ member }) => userId === member.id)
      );
      const bSortValue = Number(
        b.members.some(({ member }) => userId === member.id)
      );

      if (aSortValue !== bSortValue) return bSortValue - aSortValue;
    }

    const aSortValue = a.members.length >= 4 ? 1 : 0;
    const bSortValue = b.members.length >= 4 ? 1 : 0;

    return bSortValue - aSortValue;
  };
}
