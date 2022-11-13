import invariant from "tiny-invariant";
import type { ModeShort, StageId } from "../in-game-lists";
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
      mapList.length < input.bestOf - 1
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
        ...DEFAULT_MAP_POOL.stageModePairs.map((pair) => ({
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

  type StageValidatorInput = Pick<
    ModeWithStageAndScore,
    "score" | "stageId" | "mode"
  >;
  function stageIsOk(stage: StageValidatorInput, index: number) {
    if (usedStages.has(index)) return false;
    if (isEarlyModeRepeat(stage)) return false;
    if (isNotFollowingModePattern(stage)) return false;
    if (isMakingThingsUnfair(stage)) return false;
    if (isStageRepeatWithoutBreak(stage)) return false;
    if (isSecondPickBySameTeamInRow(stage)) return false;

    return true;
  }

  function isEarlyModeRepeat(stage: StageValidatorInput) {
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

    return score;
  }
}
