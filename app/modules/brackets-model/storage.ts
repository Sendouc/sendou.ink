/*-----------------------------------------------------------------|
 * Contains the types which are persisted in the chosen storage.
 *----------------------------------------------------------------*/

import type { StageSettings } from "./input";
import type { MatchResults } from "./other";
import type { StageType } from "./unions";

/**
 * A participant of a stage (team or individual).
 */
export interface Participant {
  /** ID of the participant. */
  id: number;

  /** ID of the tournament this participant belongs to. */
  tournament_id: number;

  /** Name of the participant. */
  name: string;
}

/**
 * A stage, which can be a round-robin stage or a single/double elimination stage.
 */
export interface Stage {
  /** ID of the stage. */
  id: number;

  /** ID of the tournament this stage belongs to. */
  tournament_id: number;

  /** Name of the stage. */
  name: string;

  /** Type of the stage. */
  type: StageType;

  /** Settings of the stage. */
  settings: StageSettings;

  /** The number of the stage in its tournament. */
  number: number;
}

/**
 * A group of a stage.
 */
export interface Group {
  /** ID of the group. */
  id: number;

  /** ID of the parent stage. */
  stage_id: number;

  /** The number of the group in its stage. */
  number: number;
}

// The next levels don't have a `name` property. They are automatically named with their `number` and their context (parent levels).

/**
 * A round of a group.
 */
export interface Round {
  /** ID of the round. */
  id: number;

  /** ID of the parent stage. */
  stage_id: number;

  /** ID of the parent group. */
  group_id: number;

  /** The number of the round in its group. */
  number: number;
}

/**
 * A match of a round.
 */
export interface Match extends MatchResults {
  /** ID of the match. */
  id: number;

  /** ID of the parent stage. */
  stage_id: number;

  /** ID of the parent group. */
  group_id: number;

  /** ID of the parent round. */
  round_id: number;

  /** The number of the match in its round. */
  number: number;

  /** The count of match games this match has. Can be `0` if it's a simple match, or a positive number for "Best Of" matches. */
  child_count: number;

  lastGameFinishedAt?: number | null;
}

/**
 * A game of a match.
 */
export interface MatchGame extends MatchResults {
  /** ID of the match game. */
  id: number;

  /** ID of the parent stage. */
  stage_id: number;

  /** ID of the parent match. */
  parent_id: number;

  /** The number of the match game in its parent match. */
  number: number;
}
