import invariant from "tiny-invariant";
import type { ModeShort, ModeWithStage } from "../in-game-lists";
import type { MapPool } from "../map-pool-serializer";
import { DEFAULT_MAP_POOL } from "./constants";
import type { TournamentMaplistInput } from "./types";
import { seededRandom } from "./utils";

type ModeWithStageAndScore = ModeWithStage & { score: number };

// xxx: don't allow going like our pick, their, their, our

export function createTournamentMapList(input: TournamentMaplistInput) {
  const { shuffle } = seededRandom(`${input.bracketType}-${input.roundNumber}`);
  const stages = shuffle(resolveStages());
  const mapList: Array<ModeWithStageAndScore & { score: number }> = [];
  let subOptimalMapList: Array<ModeWithStageAndScore> | undefined;
  let perfectMapList: Array<ModeWithStageAndScore> | undefined;
  const usedStages = new Set<number>();

  const backtrack = () => {
    if (isPerfection()) perfectMapList = [...mapList];
    if (perfectMapList) return;

    if (isSuboptimal()) subOptimalMapList = [...mapList];

    const stageList =
      mapList.length < input.bestOf - 1
        ? stages
        : input.tiebreakerMaps.stageModePairs.map((p) => ({ ...p, score: 0 }));

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

  if (perfectMapList) return perfectMapList;
  if (subOptimalMapList) return subOptimalMapList;

  throw new Error("couldn't generate maplist");

  function resolveStages() {
    const sorted = input.teams
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((t) => t.maps) as [MapPool, MapPool];

    const result = sorted[0].stageModePairs.map((pair) => ({
      ...pair,
      score: 1,
    }));

    for (const stage of sorted[1].stageModePairs) {
      const alreadyIncludedStage = result.find(
        (alreadyIncludedStage) =>
          alreadyIncludedStage.stageId === stage.stageId &&
          alreadyIncludedStage.mode === stage.mode
      );

      if (alreadyIncludedStage) {
        alreadyIncludedStage.score = 0;
      } else {
        result.push({ ...stage, score: -1 });
      }
    }

    if (
      input.teams[0].maps.stages.length === 0 &&
      input.teams[1].maps.stages.length === 0
    ) {
      // neither team submitted map, we go default
      result.push(
        ...DEFAULT_MAP_POOL.stageModePairs.map((pair) => ({
          ...pair,
          score: 0,
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

  function stageIsOk(stage: ModeWithStageAndScore, index: number) {
    if (usedStages.has(index)) return false;
    if (isEarlyModeRepeat(stage)) return false;
    if (isNotFollowingModePattern(stage)) return false;
    if (isMakingThingsUnfair(stage)) return false;
    if (isStageRepeatWithoutBreak(stage)) return false;

    return true;
  }

  function isEarlyModeRepeat(stage: ModeWithStageAndScore) {
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

  function isNotFollowingModePattern(stage: ModeWithStageAndScore) {
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
  function isMakingThingsUnfair(stage: ModeWithStageAndScore) {
    const score = mapList.reduce((acc, cur) => acc + cur.score, 0);
    const newScore = score + stage.score;

    if (score !== 0 && newScore !== 0) return true;
    if (newScore !== 0 && mapList.length + 1 === input.bestOf) return true;

    return false;
  }

  function isStageRepeatWithoutBreak(stage: ModeWithStageAndScore) {
    const lastStage = mapList[mapList.length - 1];
    if (!lastStage) return false;

    return lastStage.stageId === stage.stageId;
  }

  function isPerfection() {
    if (!isSuboptimal()) return false;
    if (new Set(mapList.map((s) => s.stageId)).size !== mapList.length) {
      return false;
    }

    return true;
  }

  function isSuboptimal() {
    if (mapList.length !== input.bestOf) return false;

    return true;
  }
}
