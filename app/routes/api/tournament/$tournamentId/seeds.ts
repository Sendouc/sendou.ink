import type { ActionFunction } from "remix";
import invariant from "tiny-invariant";
import { updateSeeds } from "~/services/tournament";
import { requireUser } from "~/utils";

export const action: ActionFunction = async ({ params, context, request }) => {
  const newSeedsString = (await request.formData()).get("seeds");
  invariant(typeof newSeedsString === "string", "Invalid type for seeds.");
  const newSeeds = JSON.parse(newSeedsString);

  const tournamentId = params.tournamentId!;
  const user = requireUser(context);

  await updateSeeds({ tournamentId, userId: user.id, newSeeds });

  return new Response(undefined, { status: 200 });
};
