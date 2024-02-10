import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";

import { emitter } from "../core/emitters.server";
import { bracketSubscriptionKey } from "../tournament-bracket-utils";
import { tournamentIdFromParams } from "~/features/tournament";
import { ignoreTransaction } from "~/utils/newrelic.server";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  ignoreTransaction();
  const tournamentId = tournamentIdFromParams(params);

  return eventStream(request.signal, (send) => {
    const handler = (args: {
      matchId: number;
      scores: [number, number];
      isOver: boolean;
    }) => {
      send({
        event: bracketSubscriptionKey(tournamentId),
        data: `${args.matchId}-${args.scores[0]}-${args.scores[1]}-${String(
          args.isOver,
        )}`,
      });
    };

    emitter.addListener(bracketSubscriptionKey(tournamentId), handler);
    return () => {
      emitter.removeListener(bracketSubscriptionKey(tournamentId), handler);
    };
  });
};
