import { Form, useMatches, useTransition } from "@remix-run/react";
import type { TournamentTeamFindManyByTournamentId } from "~/db/models/tournamentTeam";
import { useUserNew } from "~/hooks/common";
import { TournamentLoaderData } from "~/routes/to/$organization.$tournament";
import { Unpacked } from "~/utils";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { SubmitButton } from "../SubmitButton";

export function TeamRoster({
  team,
  showUnregister = false,
  deleteMode = false,
}: {
  team: Unpacked<TournamentTeamFindManyByTournamentId>;
  deleteMode?: boolean;
  showUnregister?: boolean;
}) {
  const [, parentRoute] = useMatches();
  const parentRouteData = parentRoute.data as TournamentLoaderData;
  const user = useUserNew();

  // TODO: number
  const showDeleteButtons = (userToDeleteId: number | string) => {
    return (
      parentRouteData.bracketId && deleteMode && userToDeleteId !== user?.id
    );
  };

  const showUnregisterButton = () => {
    return parentRouteData.bracketId && showUnregister;
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
                  !confirm(
                    `Unregister ${team.name} from ${parentRouteData.pageTitle}?`
                  )
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
          .sort((a, b) => Number(b.isCaptain) - Number(a.isCaptain))
          .map((member, i) => (
            <div key={member.id} className="teams-tab__member">
              <div className="teams-tab__member__order-number">
                {member.isCaptain ? "C" : i + 1}
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
  // TODO: number
  playerId: string | number;
  // TODO: number
  teamId: string | number;
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
