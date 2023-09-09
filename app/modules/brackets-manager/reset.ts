import { Status } from "~/modules/brackets-model";
import { BaseUpdater } from "./base/updater";
import * as helpers from "./helpers";

export class Reset extends BaseUpdater {
  /**
   * Resets the results of a match.
   *
   * This will update related matches accordingly.
   *
   * @param matchId ID of the match.
   */
  public matchResults(matchId: number): void {
    const stored = this.storage.select("match", matchId);
    if (!stored) throw Error("Match not found.");

    // The user can handle forfeits with matches which have child games in two possible ways:
    //
    // 1. Set forfeits for the parent match directly.
    //    --> The child games will never be updated: not locked, not finished, without forfeit. They will just be ignored and never be played.
    //    --> To reset the forfeits, the user has to reset the parent match, with `reset.matchResults()`.
    //    --> `reset.matchResults()` will be usable **only** to reset the forfeit of the parent match. Otherwise it will throw the error below.
    //
    // 2. Set forfeits for each child game.
    //    --> The parent match won't automatically have a forfeit, but will be updated with a computed score according to the forfeited match games.
    //    --> To reset the forfeits, the user has to reset each child game on its own, with `reset.matchGameResults()`.
    //    --> `reset.matchResults()` will throw the error below in all cases.
    if (!helpers.isMatchForfeitCompleted(stored) && stored.child_count > 0)
      throw Error(
        "The parent match is controlled by its child games and its result cannot be reset.",
      );

    const stage = this.storage.select("stage", stored.stage_id);
    if (!stage) throw Error("Stage not found.");

    const group = this.storage.select("group", stored.group_id);
    if (!group) throw Error("Group not found.");

    const { roundNumber, roundCount } = this.getRoundPositionalInfo(
      stored.round_id,
    );
    const matchLocation = helpers.getMatchLocation(stage.type, group.number);
    const nextMatches = this.getNextMatches(
      stored,
      matchLocation,
      stage,
      roundNumber,
      roundCount,
    );

    if (
      nextMatches.some(
        (match) =>
          match &&
          match.status >= Status.Running &&
          !helpers.isMatchByeCompleted(match),
      )
    )
      throw Error("The match is locked.");

    helpers.resetMatchResults(stored);
    this.applyMatchUpdate(stored);

    if (!helpers.isRoundRobin(stage))
      this.updateRelatedMatches(stored, true, true);
  }

  /**
   * Resets the results of a match game.
   *
   * @param gameId ID of the match game.
   */
  public matchGameResults(gameId: number): void {
    const stored = this.storage.select("match_game", gameId);
    if (!stored) throw Error("Match game not found.");

    const stage = this.storage.select("stage", stored.stage_id);
    if (!stage) throw Error("Stage not found.");

    const inRoundRobin = helpers.isRoundRobin(stage);

    helpers.resetMatchResults(stored);

    if (!this.storage.update("match_game", stored.id, stored))
      throw Error("Could not update the match game.");

    this.updateParentMatch(stored.parent_id, inRoundRobin);
  }

  /**
   * Resets the seeding of a stage.
   *
   * @param stageId ID of the stage.
   */
  public seeding(stageId: number): void {
    this.updateSeeding(stageId, null);
  }
}
