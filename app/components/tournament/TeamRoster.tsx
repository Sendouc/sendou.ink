import { Form, useMatches, useTransition } from "@remix-run/react";
import { tournamentHasNotStarted } from "~/core/tournament/validators";
import { useUser } from "~/hooks/common";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { SubmitButton } from "../SubmitButton";

export function TeamRoster({
  team,
  showUnregister = false,
  deleteMode = false,
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
  showUnregister?: boolean;
}) {
  const [, parentRoute] = useMatches();
  const tournament = parentRoute.data as FindTournamentByNameForUrlI;
  const user = useUser();

  const showDeleteButtons = (userToDeleteId: string) => {
    return (
      tournamentHasNotStarted(tournament) &&
      deleteMode &&
      userToDeleteId !== user?.id
    );
  };

  const showUnregisterButton = () => {
    return tournamentHasNotStarted(tournament) && showUnregister;
  };

  return (
    <div className="teams-tab__team-container">
      <div className="teams-tab__team-name">
        {team.name}
        {showUnregisterButton() ? (
          <Form method="post" className="flex justify-center">
            <input type="hidden" name="_action" value="UNREGISTER" />
            <input type="hidden" name="teamId" value={team.id} />
            <SubmitButton
              actionType="UNREGISTER"
              tiny
              variant="minimal-destructive"
              loadingText="Unregistering..."
              onClick={(e) => {
                if (
                  !confirm(`Unregister ${team.name} from ${tournament.name}?`)
                ) {
                  e.preventDefault();
                }
              }}
              data-cy="unregister-button"
            >
              Unregister
            </SubmitButton>
          </Form>
        ) : null}
      </div>
      <div className="teams-tab__members-container">
        {team.members
          .sort((a, b) => Number(b.captain) - Number(a.captain))
          .map(({ member, captain }, i) => (
            <div key={member.id} className="teams-tab__member">
              <div className="teams-tab__member__order-number">
                {captain ? "C" : i + 1}
              </div>
              <div className="teams-tab__member__container">
                <Avatar user={member} />
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
  const transition = useTransition();
  return (
    <Form method="post">
      <input type="hidden" name="_action" value="DELETE_PLAYER" />
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="userId" value={playerId} />
      <Button
        variant="destructive"
        tiny
        loading={transition.state !== "idle"}
        data-cy="remove-player-button"
      >
        Remove
      </Button>
    </Form>
  );
}
