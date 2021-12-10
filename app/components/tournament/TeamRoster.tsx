import { useFetcher } from "remix";
import { useUser } from "~/utils/hooks";
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

  const showDeleteButtons = (userToDeleteId: string) => {
    // TODO:
    const tournamentHasStarted = false;

    return !tournamentHasStarted && deleteMode && userToDeleteId !== user?.id;
  };

  return (
    <div className="teams-tab__team-container">
      <div className="teams-tab__team-name">{team.name}</div>
      <div className="teams-tab__members-container">
        {team.members
          .sort((a, b) => Number(b.captain) - Number(a.captain))
          .map(({ member, captain }, i) => (
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
                    <DeleteFromRosterButton
                      playerId={member.id}
                      teamId={team.id}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function DeleteFromRosterButton({
  playerId,
  teamId,
}: {
  playerId: string;
  teamId: string;
}) {
  const fetcher = useFetcher();
  return (
    <MyForm
      action={`/api/tournamentTeam/${teamId}/remove-player/${playerId}`}
      method="delete"
      fetcher={fetcher}
    >
      <Button
        variant="destructive"
        tiny
        loadingText="Removing..."
        loading={fetcher.state !== "idle"}
      >
        Remove
      </Button>
    </MyForm>
  );
}
