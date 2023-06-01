/*---------------------------------------------------------------------------|
 * Contains the rest of the types which doesn't belong to the other files.
 *--------------------------------------------------------------------------*/

import type { Result } from "./unions";

/**
 * The possible status for a match.
 */
export enum Status {
  /** The two matches leading to this one are not completed yet. */
  Locked = 0,

  /** One participant is ready and waiting for the other one. */
  Waiting = 1,

  /** Both participants are ready to start. */
  Ready = 2,

  /** The match is running. */
  Running = 3,

  /** The match is completed. */
  Completed = 4,

  /** At least one participant completed his following match. */
  Archived = 5,
}

/**
 * The results of a participant in a match.
 */
export interface ParticipantResult {
  /** If `null`, the participant is to be determined. */
  id: number | null;

  /** Indicates where the participant comes from. */
  position?: number;

  /** If this participant forfeits, the other automatically wins. */
  forfeit?: boolean;

  /** The current score of the participant. */
  score?: number;

  /** Tells what is the result of a duel for this participant. */
  result?: Result;
}

/**
 * Only contains information about match status and results.
 */
export interface MatchResults {
  /** Status of the match. */
  status: Status;

  /** First opponent of the match. */
  opponent1: ParticipantResult | null;

  /** Second opponent of the match. */
  opponent2: ParticipantResult | null;
}
