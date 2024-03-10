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

// xxx: support type: PLAY_ALL
export type BracketMapCounts = Map<
  // round.group_id ->
  number,
  // round.number ->
  Map<number, { count: number; type: "BEST_OF" }>
>;

interface GenerateTournamentRoundMaplistArgs {
  pool: Array<{ mode: ModeShort; stageId: StageId }>;
  rounds: Round[];
  mapCounts: BracketMapCounts;
  type: TournamentBracketProgression[number]["type"];
}

// xxx: future improvement could be slightly biasing against maps that appear in slots that are not guaranteed to be played
export function generateTournamentRoundMaplist(
  args: GenerateTournamentRoundMaplistArgs,
) {
  // in round robin different group ids represent different groups
  // but they share the map list
  const filteredRounds = getFilteredRounds(args.rounds, args.type);

  // sort rounds in a way that allows us to space maps out
  // so in the typical order that people play out the tournament
  const sortedRounds = sortRounds(filteredRounds, args.type);

  const modeFrequency = new Map<ModeShort, number>();
  const stageAppearance = new Map<StageId, number>();
  const comboAppearance = new Map<string, number>();

  //                roundId
  const result: Map<number, TournamentRoundMaps> = new Map();

  for (const [iteration, round] of sortedRounds.entries()) {
    const count = resolveRoundMapCount(round, args.mapCounts, args.type);
    const modes = modeOrder(count, args.pool, modeFrequency, iteration);

    result.set(round.id, {
      count,
      type: "BEST_OF",
      list: modes.map((mode) => ({
        mode,
        stageId: resolveStage(
          mode,
          args.pool,
          stageAppearance,
          comboAppearance,
          iteration,
        ),
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

function sortRounds(
  rounds: Round[],
  type: TournamentBracketProgression[number]["type"],
) {
  const minGroupId = Math.min(...rounds.map((x) => x.group_id));
  const maxGroupId = Math.max(...rounds.map((x) => x.group_id));

  return rounds.slice().sort((a, b) => {
    if (type === "double_elimination") {
      // grands last
      if (a.group_id === maxGroupId && b.group_id !== maxGroupId) return 1;
      if (a.group_id !== maxGroupId && b.group_id === maxGroupId) return -1;
      if (a.group_id === maxGroupId && b.group_id === maxGroupId) {
        return a.number - b.number;
      }

      const winnersMaxRoundNumber = Math.max(
        ...rounds.filter((x) => x.group_id === minGroupId).map((x) => x.number),
      );
      const isLastWinnersRound = (r: Round) =>
        r.group_id === minGroupId && r.number === winnersMaxRoundNumber;

      // winners finals just before grands
      if (isLastWinnersRound(a) && !isLastWinnersRound(b)) return 1;
      if (!isLastWinnersRound(a) && isLastWinnersRound(b)) return -1;
    }

    return a.number - b.number;
  });
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

function modeOrder(
  count: number,
  pool: GenerateTournamentRoundMaplistArgs["pool"],
  modeFrequency: Map<ModeShort, number>,
  iteration: number,
) {
  const modes = removeDuplicates(pool.map((x) => x.mode));
  const shuffledModes = shuffle(modes);
  shuffledModes.sort((a, b) => {
    const aFreq = modeFrequency.get(a) ?? 0;
    const bFreq = modeFrequency.get(b) ?? 0;

    return aFreq - bFreq;
  });

  const result: ModeShort[] = [];

  let currentI = 0;
  while (result.length < count) {
    result.push(shuffledModes[currentI]);
    modeFrequency.set(shuffledModes[currentI], iteration);
    currentI++;
    if (currentI >= shuffledModes.length) {
      currentI = 0;
    }
  }

  return result;
}

const serializedMap = (mode: ModeShort, stage: StageId) => `${mode}-${stage}`;

function resolveStage(
  mode: ModeShort,
  pool: GenerateTournamentRoundMaplistArgs["pool"],
  stageAppearance: Map<StageId, number>,
  comboAppearance: Map<string, number>,
  currentIteration: number,
) {
  const allOptions = pool.filter((x) => x.mode === mode).map((x) => x.stageId);

  let equallyGoodOptionsIgnoringCombo: StageId[] = [];
  {
    let earliestAppearance = Infinity;
    for (const option of allOptions) {
      const appearance = stageAppearance.get(option) ?? -1;
      if (appearance < earliestAppearance) {
        earliestAppearance = appearance;
        equallyGoodOptionsIgnoringCombo = [];
      }

      if (appearance === earliestAppearance) {
        equallyGoodOptionsIgnoringCombo.push(option);
      }
    }
  }

  let bestOptions: StageId[] = [];
  {
    let earliestAppearance = Infinity;
    for (const option of equallyGoodOptionsIgnoringCombo) {
      const appearance = comboAppearance.get(serializedMap(mode, option)) ?? -1;
      if (appearance < earliestAppearance) {
        earliestAppearance = appearance;
        bestOptions = [];
      }

      if (appearance === earliestAppearance) {
        bestOptions.push(option);
      }
    }
  }

  const stage = shuffle(equallyGoodOptionsIgnoringCombo)[0];
  if (typeof stage !== "number") {
    const fallback = shuffle(SENDOUQ_DEFAULT_MAPS[mode].slice())[0];
    logger.warn(
      `No stage found for mode ${mode} iteration ${currentIteration}, using fallback ${fallback}`,
    );
    return fallback;
  }

  stageAppearance.set(stage, currentIteration);
  comboAppearance.set(
    serializedMap(mode, stage),
    (comboAppearance.get(serializedMap(mode, stage)) ?? 0) + 1,
  );

  return stage;
}
