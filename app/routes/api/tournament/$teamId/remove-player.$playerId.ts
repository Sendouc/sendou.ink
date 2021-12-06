import { ActionFunction } from "@remix-run/server-runtime";
import { removePlayerFromTeam } from "~/services/tournament";
import { requireUser } from "~/utils";

export const action: ActionFunction = async ({ params, context }) => {
  const teamId = params.teamId!;
  const playerId = params.playerId!;

  const user = requireUser(context);

  await removePlayerFromTeam({
    captainId: user.id,
    playerId,
    teamId,
  });
  return new Response("Player deleted from team", { status: 200 });
};
