import type { ActionFunction } from "remix";
import { checkOut } from "~/services/tournament";
import { requireUser } from "~/utils";

export const action: ActionFunction = async ({ params, context }) => {
  const teamId = params.teamId!;
  const user = requireUser(context);

  await checkOut({ teamId, userId: user.id });

  return new Response(undefined, { status: 200 });
};
