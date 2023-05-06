import type { LoaderArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "../core/emitters.server";
import {
  matchIdFromParams,
  matchSubscriptionKey,
} from "../tournament-bracket-utils";

export const loader = ({ request, params }: LoaderArgs) => {
  const matchId = matchIdFromParams(params);

  return eventStream(request.signal, (send) => {
    const handler = (id: string) => {
      send({ event: matchSubscriptionKey(matchId), data: id });
    };

    emitter.addListener(matchSubscriptionKey(matchId), handler);
    return () => {
      emitter.removeListener(matchSubscriptionKey(matchId), handler);
    };
  });
};
