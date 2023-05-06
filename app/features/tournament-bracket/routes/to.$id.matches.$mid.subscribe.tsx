import type { LoaderArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "../core/emitters.server";
import { EVENTS } from "../tournament-bracket-contants";

export const loader = ({ request }: LoaderArgs) => {
  return eventStream(request.signal, (send) => {
    const handler = (id: string) => {
      send({ event: EVENTS.MATCH_CHANGED, data: id });
    };

    emitter.addListener(EVENTS.MATCH_CHANGED, handler);
    return () => {
      emitter.removeListener(EVENTS.MATCH_CHANGED, handler);
    };
  });
};
