import invariant from "tiny-invariant";
import type { Tables } from "~/db/tables";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import { logger } from "~/utils/logger";
import { assertUnreachable } from "~/utils/types";
import { isAdmin } from "~/permissions";
import { TOURNAMENT } from "~/features/tournament";
import type { TournamentData } from "./Tournament.server";
import {
  HACKY_isInviteOnlyEvent,
  HACKY_resolvePicture,
} from "~/features/tournament/tournament-utils";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type { ModeShort } from "~/modules/in-game-lists";
import { databaseTimestampToDate } from "~/utils/dates";

type OptionalIdObject = { id: number } | undefined;

/** Extends and providers utility functions on top of the bracket-manager library. Updating data after the bracket has started is responsibility of bracket-manager. */
export class Tournament {
  private data: ValueToArray<DataTypes>;
  private brackets: Bracket[] = [];
  ctx;

  // xxx: filter teams based on check-in after tournament starts?
  constructor({ data, ctx }: TournamentData) {
    this.data = data;
    this.ctx = { ...ctx, startTime: databaseTimestampToDate(ctx.startTime) };

    this.initBrackets();
  }

  private initBrackets() {
    for (const [
      i,
      { format, name, sources },
    ] of this.ctx.bracketsStyle.entries()) {
      const inProgressStage = this.ctx.inProgressBrackets.find(
        (stage) => stage.name === name,
      );

      if (inProgressStage) {
        this.brackets.push(
          Bracket.create({
            preview: false,
            // xxx: does anything else need to be filtered?
            data: {
              ...this.data,
              match: this.data.match.filter(
                (match) => match.stage_id === inProgressStage.id,
              ),
            },
            // xxx: type: format,
            type: inProgressStage.type,
          }),
        );
      } else {
        // TODO: create bracket by creating new in memory bracket
      }
    }
  }

  get logoSrc() {
    return HACKY_resolvePicture(this.ctx);
  }

  get modesIncluded(): ModeShort[] {
    switch (this.ctx.mapPickingStyle) {
      case "AUTO_SZ": {
        return ["SZ"];
      }
      case "AUTO_TC": {
        return ["TC"];
      }
      case "AUTO_RM": {
        return ["RM"];
      }
      case "AUTO_CB": {
        return ["CB"];
      }
      default: {
        return [...rankedModesShort];
      }
    }
  }

  get mapPickCountPerMode() {
    return this.modesIncluded.length === 1
      ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
      : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;
  }

  get hasOpenRegistration() {
    return !HACKY_isInviteOnlyEvent(this.ctx);
  }

  get hasStarted() {
    return this.brackets.some((bracket) => !bracket.preview);
  }

  get everyBracketOver() {
    return this.brackets.every((bracket) => bracket.everyMatchOver);
  }

  teamById(id: number) {
    return this.ctx.teams.find((team) => team.id === id);
  }

  // const { progress, currentMatchId, currentOpponent } = (() => {
  //   let lowestStatus: Status = Infinity;
  //   let currentMatchId: number | undefined;
  //   let currentOpponent: string | undefined;

  //   if (!myTeam) {
  //     return {
  //       progress: undefined,
  //       currentMatchId: undefined,
  //       currentOpponent: undefined,
  //     };
  //   }

  //   for (const match of data.bracket.match) {
  //     // BYE
  //     if (match.opponent1 === null || match.opponent2 === null) {
  //       continue;
  //     }

  //     if (
  //       (match.opponent1.id === myTeam.id ||
  //         match.opponent2.id === myTeam.id) &&
  //       lowestStatus > match.status
  //     ) {
  //       lowestStatus = match.status;
  //       currentMatchId = match.id;
  //       const otherTeam =
  //         match.opponent1.id === myTeam.id ? match.opponent2 : match.opponent1;
  //       currentOpponent = parentRouteData.teams.find(
  //         (team) => team.id === otherTeam.id,
  //       )?.name;
  //     }
  //   }

  //   return { progress: lowestStatus, currentMatchId, currentOpponent };
  // })();
  progress(user: OptionalIdObject) {
    // return opponent team name + match id
    // or null if not started / not in the tournament
    // or "WAITING" if still in tournament but no match currently
    // or "CHECK-IN"..?
    return null;
  }

  canFinalize(user: OptionalIdObject) {
    return (
      this.everyBracketOver && this.isOrganizer(user) && !this.ctx.isFinalized
    );
  }

  // xxx: read from settings or HACKY
  get subsFeatureEnabled() {
    return true;
  }

  canAddSubs(user: OptionalIdObject) {
    return (
      !this.everyBracketOver && this.hasStarted && this.ownedTeamByUser(user)
    );
  }

  canCheckInToBracket(bracketIdx: number, user: OptionalIdObject) {
    const team = this.teamMemberOfByUser(user);
    if (!team) return false;

    // bracket already started
    const bracket = this.bracketByIdxOrDefault(bracketIdx);
    if (!bracket.preview) return false;

    // already checked in
    if (team.checkIns.some((checkIn) => checkIn.bracketIdx === bracketIdx)) {
      return false;
    }

    return true;
  }

  // xxx: setting or if (HACKY_isSendouQSeasonFinale(event)) return 5;
  get maxTeamMemberCount() {
    if (this.hasStarted) {
      return TOURNAMENT.DEFAULT_TEAM_MAX_MEMBERS_BEFORE_START + 1;
    }

    return TOURNAMENT.DEFAULT_TEAM_MAX_MEMBERS_BEFORE_START;
  }

  get regularCheckInIsOpen() {
    return (
      this.regularCheckInStartsAt < new Date() &&
      this.regularCheckInEndsAt > new Date()
    );
  }

  get regularCheckInHasEnded() {
    return this.ctx.startTime < new Date();
  }

  get regularCheckInStartsAt() {
    const result = new Date(this.ctx.startTime);
    result.setMinutes(result.getMinutes() - 60);
    return result;
  }

  get regularCheckInEndsAt() {
    return this.ctx.startTime;
  }

  bracketByIdxOrDefault(idx: number): Bracket {
    const bracket = this.brackets[idx];
    if (bracket) return bracket;

    const defaultBracket = this.brackets[0];
    invariant(defaultBracket, "No brackets found");

    logger.warn("Bracket not found, using fallback bracket");
    return defaultBracket;
  }

  bracketByIdx(idx: number) {
    const bracket = this.brackets[idx];
    if (!bracket) return null;

    return bracket;
  }

  ownedTeamByUser(user: OptionalIdObject) {
    if (!user) return null;

    return this.ctx.teams.find((team) =>
      team.members.some((member) => member.id === user.id && member.isOwner),
    );
  }

  teamMemberOfByUser(user: OptionalIdObject) {
    if (!user) return null;

    return this.ctx.teams.find((team) =>
      team.members.some((member) => member.id === user.id),
    );
  }

  isOrganizer(user: OptionalIdObject) {
    if (!user) return false;
    if (isAdmin(user)) return true;

    return this.ctx.staff.some(
      (staff) => staff.id === user.id && staff.role === "ORGANIZER",
    );
  }
}

interface BracketArgs {
  preview: boolean;
  data: ValueToArray<DataTypes>;
  type: Tables["TournamentStage"]["type"];
}

abstract class Bracket {
  preview: boolean;
  data: ValueToArray<DataTypes>;

  constructor({
    preview,
    data,
  }: {
    preview: boolean;
    data: ValueToArray<DataTypes>;
  }) {
    this.preview = preview;
    this.data = data;
  }

  // xxx: logic
  // return (
  //   databaseTimestampToDate(parentRouteData.tournament.startTime).getTime() <
  //   Date.now()
  // );
  get canBeStarted() {
    return true;
  }

  get everyMatchOver() {
    return true;
  }

  get enoughTeams() {
    return this.data.participant.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START;
  }

  static create(
    args: BracketArgs,
  ): SingleEliminationBracket | DoubleEliminationBracket | RoundRobinBracket {
    switch (args.type) {
      case "single_elimination": {
        return new SingleEliminationBracket(args);
      }
      case "double_elimination": {
        return new DoubleEliminationBracket(args);
      }
      case "round_robin": {
        return new RoundRobinBracket(args);
      }
      default: {
        assertUnreachable(args.type);
      }
    }
  }
}

class SingleEliminationBracket extends Bracket {
  constructor(args: BracketArgs) {
    super(args);
  }
}

class DoubleEliminationBracket extends Bracket {
  constructor(args: BracketArgs) {
    super(args);
  }
}

class RoundRobinBracket extends Bracket {
  constructor(args: BracketArgs) {
    super(args);
  }
}
