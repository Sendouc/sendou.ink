import * as React from "react";
import { useLoaderData } from "remix";
import type { BracketData } from "server/events";
import type { BracketModified } from "~/services/bracket";
import { useEvents } from "~/utils/hooks";

export function useBracketDataWithEvents(): BracketModified {
  const data = useLoaderData<BracketModified>();
  const [dataWithEvents, setDataWithEvents] = React.useState(data);

  const handleEvent = (data: unknown) => {
    for (const { number, participants, score } of data as BracketData) {
      setDataWithEvents({
        ...dataWithEvents,
        rounds: dataWithEvents.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((match) => {
            if (match.number !== number) return match;
            return {
              ...match,
              participants: participants ?? match.participants,
              score: score ?? match.score,
            };
          }),
        })),
      });
    }
  };

  useEvents(data.id, handleEvent);

  return dataWithEvents;
}
