import invariant from "tiny-invariant";
import { type ModeShort, type StageId, stageIds } from "../in-game-lists";
import { DEFAULT_MAP_POOL } from "./constants";
import type {
  TournamentMaplistInput,
  TournamentMapListMap,
  TournamentMaplistSource,
} from "./types";
import { seededRandom } from "./utils";

type ModeWithStageAndScore = TournamentMapListMap & { score: number };

const OPTIMAL_MAPLIST_SCORE = 0;

export function createTournamentMapList(
  input: TournamentMaplistInput
): Array<TournamentMapListMap> {
  const { shuffle } = seededRandom(`${input.bracketType}-${input.roundNumber}`);
  const stages = shuffle(resolveStages());
  const mapList: Array<ModeWithStageAndScore & { score: number }> = [];
  const bestMapList: { maps?: Array<ModeWithStageAndScore>; score: number } = {
    score: Infinity,
  };
  const usedStages = new Set<number>();

  const backtrack = () => {
    const mapListScore = rateMapList();
    if (typeof mapListScore === "number" && mapListScore < bestMapList.score) {
      bestMapList.maps = [...mapList];
      bestMapList.score = mapListScore;
    }

    // There can't be better map list than this
    if (bestMapList.score === OPTIMAL_MAPLIST_SCORE) {
      return;
    }

    const stageList =
      mapList.length < input.bestOf - 1 ||
      // in 1 mode only the tiebreaker is not a thing
      (input.modesIncluded && input.modesIncluded.length === 1)
        ? stages
        : input.tiebreakerMaps.stageModePairs.map((p) => ({
            ...p,
            score: 0,
            source: "TIEBREAKER" as const,
          }));

    for (const [i, stage] of stageList.entries()) {
      if (!stageIsOk(stage, i)) continue;
      mapList.push(stage);
      usedStages.add(i);

      backtrack();

      usedStages.delete(i);
      mapList.pop();
    }
  };

  backtrack();

  if (bestMapList.maps) return bestMapList.maps;

  throw new Error("couldn't generate maplist");

  function resolveStages() {
    const sorted = input.teams
      .slice()
      .sort((a, b) => a.id - b.id) as TournamentMaplistInput["teams"];

    const result = sorted[0].maps.stageModePairs.map((pair) => ({
      ...pair,
      score: 1,
      source: sorted[0].id as TournamentMaplistSource,
    }));

    for (const stage of sorted[1].maps.stageModePairs) {
      const alreadyIncludedStage = result.find(
        (alreadyIncludedStage) =>
          alreadyIncludedStage.stageId === stage.stageId &&
          alreadyIncludedStage.mode === stage.mode
      );

      if (alreadyIncludedStage) {
        alreadyIncludedStage.score = 0;
        alreadyIncludedStage.source = "BOTH";
      } else {
        result.push({ ...stage, score: -1, source: sorted[1].id });
      }
    }

    if (
      input.teams[0].maps.stages.length === 0 &&
      input.teams[1].maps.stages.length === 0
    ) {
      // neither team submitted map, we go default
      result.push(
        ...getDefaultMapPool().map((pair) => ({
          ...pair,
          score: 0,
          source: "DEFAULT" as const,
        }))
      );
    } else if (
      input.teams[0].maps.stages.length === 0 ||
      input.teams[1].maps.stages.length === 0
    ) {
      // let's set it up for later that if one team doesn't have stages set
      // we can make a maplist consisting of only stages from the team that did submit
      for (const stageObj of result) {
        stageObj.score = 0;
      }
    }

    return result.sort((a, b) =>
      `${a.stageId}-${a.mode}`.localeCompare(`${b.stageId}-${b.mode}`)
    );
  }

  function getDefaultMapPool() {
    if (input.modesIncluded && input.modesIncluded.length === 1) {
      const mode = input.modesIncluded[0]!;

      return stageIds.map((id) => ({ mode, stageId: id }));
    }

    return DEFAULT_MAP_POOL.stageModePairs;
  }

  type StageValidatorInput = Pick<
    ModeWithStageAndScore,
    "score" | "stageId" | "mode"
  >;

  // adding rules here can achieve to things
  // 1) adjust what kind of map list is generated
  // 2) optimize the algorithm my eliminating subtrees from consideration
  function stageIsOk(stage: StageValidatorInput, index: number) {
    if (usedStages.has(index)) return false;
    if (isEarlyModeRepeat(stage)) return false;
    if (isNotFollowingModePattern(stage)) return false;
    if (isMakingThingsUnfair(stage)) return false;
    if (isStageRepeatWithoutBreak(stage)) return false;
    if (isSecondPickBySameTeamInRow(stage)) return false;
    if (wouldPreventTiebreaker(stage)) return false;

    return true;
  }

  function tournamentIsOneModeOnly() {
    return input.modesIncluded && input.modesIncluded.length === 1;
  }

  function isEarlyModeRepeat(stage: StageValidatorInput) {
    if (tournamentIsOneModeOnly()) return false;

    // all modes already appeared
    if (mapList.length >= 4) return false;

    if (
      mapList.some(
        (alreadyIncludedStage) => alreadyIncludedStage.mode === stage.mode
      )
    ) {
      return true;
    }

    return false;
  }

  function isNotFollowingModePattern(stage: StageValidatorInput) {
    if (tournamentIsOneModeOnly()) return false;

    // not all modes appeared yet
    if (mapList.length < 4) return false;

    let previousModeShouldBe: ModeShort | undefined;
    for (let i = 0; i < mapList.length; i++) {
      if (mapList[i]!.mode === stage.mode) {
        if (i === 0) {
          previousModeShouldBe = mapList[mapList.length - 1]!.mode;
        } else {
          previousModeShouldBe = mapList[i - 1]!.mode;
        }
      }
    }
    invariant(previousModeShouldBe, "Couldn't resolve maplist pattern");

    return mapList[mapList.length - 1]!.mode !== previousModeShouldBe;
  }

  // don't allow making two picks from one team in row
  function isMakingThingsUnfair(stage: StageValidatorInput) {
    const score = mapList.reduce((acc, cur) => acc + cur.score, 0);
    const newScore = score + stage.score;

    if (score !== 0 && newScore !== 0) return true;
    if (newScore !== 0 && mapList.length + 1 === input.bestOf) return true;

    return false;
  }

  function isStageRepeatWithoutBreak(stage: StageValidatorInput) {
    const lastStage = mapList[mapList.length - 1];
    if (!lastStage) return false;

    return lastStage.stageId === stage.stageId;
  }

  function isSecondPickBySameTeamInRow(stage: StageValidatorInput) {
    const lastStage = mapList[mapList.length - 1];
    if (!lastStage) return false;
    if (stage.score === 0) return false;

    return lastStage.score === stage.score;
  }

  function wouldPreventTiebreaker(stage: StageValidatorInput) {
    // tiebreaker always guaranteed if not one mode
    if (!input.modesIncluded || input.modesIncluded.length !== 1) return false;

    const commonMaps = input.teams[0].maps.stageModePairs.filter(
      ({ stageId, mode }) =>
        input.teams[1].maps.stageModePairs.some(
          (pair) => pair.stageId === stageId && pair.mode === mode
        )
    );

    const newMapList = [...mapList, stage];

    const newCommonMaps = commonMaps.filter(
      ({ stageId, mode }) =>
        !newMapList.some(
          (pair) => pair.stageId === stageId && pair.mode === mode
        )
    );

    // there was at least one possible common map
    // to pick as tiebreaker but it (or they) got picked too early
    return (
      commonMaps.length > 0 &&
      newCommonMaps.length === 0 &&
      newMapList.length !== input.bestOf
    );
  }

  function rateMapList() {
    // not a full map list
    if (mapList.length !== input.bestOf) return;

    let score = OPTIMAL_MAPLIST_SCORE;

    const appearedMaps = new Map<StageId, number>();
    for (const stage of mapList) {
      const timesAppeared = appearedMaps.get(stage.stageId) ?? 0;

      if (timesAppeared > 0) {
        score += timesAppeared;
      }

      appearedMaps.set(stage.stageId, timesAppeared + 1);
    }

    if (!lastMapIsAGoodTieBreaker()) {
      score += 1;
    }

    return score;
  }

  function lastMapIsAGoodTieBreaker() {
    // guaranteed to be good if more than one mode
    if (!input.modesIncluded || input.modesIncluded.length !== 1) return true;

    // we can't have a map from pools of both teams if both didn't submit maps
    if (input.teams.some((team) => team.maps.stageModePairs.length === 0)) {
      return true;
    }

    const tieBreakerMap = mapList[mapList.length - 1]!;

    let appearanceCount = 0;

    for (const team of input.teams) {
      for (const stage of team.maps.stages) {
        if (stage === tieBreakerMap.stageId) appearanceCount++;
      }
    }

    return appearanceCount === 2;
  }
}
