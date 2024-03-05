/** Map list generation logic for "TO pick" as in the map list is defined beforehand by TO and teams don't pick */

import shuffle from "just-shuffle";
import type {
  TournamentBracketProgression,
  TournamentRoundMaps,
} from "~/db/tables";
import type { Round } from "~/modules/brackets-model";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { SENDOUQ_DEFAULT_MAPS } from "~/modules/tournament-map-list-generator/constants";
import { removeDuplicates } from "~/utils/arrays";
import { logger } from "~/utils/logger";

export type BracketMapCounts = Map<
  number,
  // TODO: support type: PLAY_ALL
  Map<number, { count: 3 | 5 | 7; type: "BEST_OF" }>
>;

interface GenerateTournamentRoundMaplistArgs {
  pool: Array<{ mode: ModeShort; stageId: StageId }>;
  rounds: Round[];
  mapCounts: BracketMapCounts;
  type: TournamentBracketProgression[number]["type"];
}

export function generateTournamentRoundMaplist(
  args: GenerateTournamentRoundMaplistArgs,
) {
  // in round robin different group ids represent different groups
  // but they share the map list
  const filteredRounds = getFilteredRounds(args.rounds, args.type);

  // sort rounds in a way that allows us to space maps out
  // so in the typical order that people play out the tournament
  const sortedRounds = sortRounds(filteredRounds);

  const modeFrequency = new Map<ModeShort, number>();
  const stageAppearance = new Map<StageId, number>();

  //                roundId
  const result: Map<number, TournamentRoundMaps> = new Map();

  for (const [iteration, round] of sortedRounds.entries()) {
    const count = resolveRoundMapCount(round, args.mapCounts, args.type);
    const modes = modeOrder(count, args.pool, modeFrequency);

    result.set(round.id, {
      count,
      type: "BEST_OF",
      list: modes.map((mode) => ({
        mode,
        stageId: resolveStage(mode, args.pool, stageAppearance, iteration),
      })),
    });
  }

  return result;
}

function getFilteredRounds(
  rounds: Round[],
  type: TournamentBracketProgression[number]["type"],
) {
  if (type !== "round_robin") return rounds;

  // highest group id because lower group id's can have byes that higher don't
  const highestGroupId = Math.max(...rounds.map((x) => x.group_id));
  return rounds.filter((x) => x.group_id === highestGroupId);
}

function sortRounds(rounds: Round[]) {
  // xxx: also handle grand finals etc. last
  return rounds.slice().sort((a, b) => a.number - b.number);
}

function resolveRoundMapCount(
  round: Round,
  counts: BracketMapCounts,
  type: TournamentBracketProgression[number]["type"],
) {
  // with rr we just take the first group id
  // as every group has the same map list
  const groupId =
    type === "round_robin"
      ? Math.max(...Array.from(counts.keys()))
      : round.group_id;

  const count = counts.get(groupId)?.get(round.number)?.count;
  if (typeof count === "undefined") {
    logger.warn(
      `No map count found for round ${round.number} (group ${round.group_id})`,
    );
    return 5;
  }

  return count;
}

// xxx: take in account mode frequency
function modeOrder(
  count: number,
  pool: GenerateTournamentRoundMaplistArgs["pool"],
  _modeFrequency: Map<ModeShort, number>,
) {
  const modes = removeDuplicates(pool.map((x) => x.mode));
  const shuffledModes = shuffle(modes);

  const result: ModeShort[] = [];

  let currentI = 0;
  while (result.length < count) {
    result.push(shuffledModes[currentI]);
    currentI++;
    if (currentI >= shuffledModes.length) {
      currentI = 0;
    }
  }

  return result;
}

function resolveStage(
  mode: ModeShort,
  pool: GenerateTournamentRoundMaplistArgs["pool"],
  stageAppearance: Map<StageId, number>,
  currentIteration: number,
) {
  const allOptions = pool.filter((x) => x.mode === mode).map((x) => x.stageId);

  let earliestAppearance = Infinity;
  let equallyGoodOptions: StageId[] = [];
  for (const option of allOptions) {
    const appearance = stageAppearance.get(option) ?? -1;
    if (appearance < earliestAppearance) {
      earliestAppearance = appearance;
      equallyGoodOptions = [];
    }

    if (appearance === earliestAppearance) {
      equallyGoodOptions.push(option);
    }
  }

  const stage = shuffle(equallyGoodOptions)[0];
  if (typeof stage !== "number") {
    const fallback = shuffle(SENDOUQ_DEFAULT_MAPS[mode].slice())[0];
    logger.warn(
      `No stage found for mode ${mode} iteration ${currentIteration}, using fallback ${fallback}`,
    );
    return fallback;
  }

  stageAppearance.set(stage, currentIteration);

  return stage;
}
