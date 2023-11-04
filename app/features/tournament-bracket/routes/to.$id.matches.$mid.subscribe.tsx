import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "../core/emitters.server";
import {
  matchIdFromParams,
  matchSubscriptionKey,
} from "../tournament-bracket-utils";
import { getUserId } from "~/features/auth/core/user.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const loggedInUser = await getUserId(request);
  const matchId = matchIdFromParams(params);

  return eventStream(request.signal, (send) => {
    const handler = (args: { eventId: string; userId: number }) => {
      // small optimization not to send the event
      // if the user is the one who triggered the event
      if (args.userId === loggedInUser?.id) return;
      send({ event: matchSubscriptionKey(matchId), data: args.eventId });
    };

    emitter.addListener(matchSubscriptionKey(matchId), handler);
    return () => {
      emitter.removeListener(matchSubscriptionKey(matchId), handler);
    };
  });
};
