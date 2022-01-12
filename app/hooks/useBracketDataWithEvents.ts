import * as React from "react";
import { useLoaderData } from "remix";
import type { BracketData } from "server/events";
import type { BracketModified } from "~/services/bracket";
import { useEvents } from "~/utils/hooks";

export function useBracketDataWithEvents(): BracketModified {
  const data = useLoaderData<BracketModified>();
  const [dataWithEvents, setDataWithEvents] = React.useState(data);

  const handleEvent = (data: unknown) => {
    const [matchNumber, teamUpper, teamLower, scoreUpper, scoreLower] =
      data as BracketData;

    setDataWithEvents({
      ...dataWithEvents,
      rounds: dataWithEvents.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) => {
          if (match.number !== matchNumber) return match;
          return {
            ...match,
            participants: [teamUpper, teamLower],
            score: [scoreUpper, scoreLower],
          };
        }),
      })),
    });
  };

  useEvents(data.id, handleEvent);

  return dataWithEvents;
}
