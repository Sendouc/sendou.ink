import { useIsSubmitting, useUser } from "~/utils";
import { Button } from "../Button";
import { MyForm } from "../MyForm";

export function TeamRoster({
  team,
  deleteMode: deleteMode,
}: {
  team: {
    id: string;
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
  deleteMode?: boolean;
}) {
  const user = useUser();
  const isSubmitting = useIsSubmitting("DELETE");

  const showDeleteButtons = (userToDeleteId: string) => {
    // TODO:
    const tournamentHasStarted = false;

    return !tournamentHasStarted && deleteMode && userToDeleteId !== user?.id;
  };

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
              <div className="teams-tab__member__container__name-button">
                <div>{member.discordName}</div>
                {showDeleteButtons(member.id) && (
                  <MyForm
                    method="delete"
                    hiddenFields={{ userId: member.id, teamId: team.id }}
                  >
                    <Button
                      variant="destructive"
                      tiny
                      loadingText="Removing..."
                      loading={isSubmitting}
                    >
                      Remove
                    </Button>
                  </MyForm>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
