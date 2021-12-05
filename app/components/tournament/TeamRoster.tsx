export function TeamRoster({
  team,
}: {
  team: {
    name: string;
    members: {
      captain: boolean;
      member: {
        id: string;
        discordAvatar: string | null;
        discordId: string;
        discordName: string;
      };
    }[];
  };
}) {
  return (
    <div className="teams-tab__team-container">
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
    </div>
  );
}
