import invariant from "tiny-invariant";
import type { BracketFormat, TournamentBracketsStyle } from "~/db/tables";
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
import { getTournamentManager } from "..";
import {
  fillWithNullTillPowerOfTwo,
  resolveTournamentStageType,
} from "../tournament-bracket-utils";
import type { Stage } from "~/modules/brackets-model";
import { Bracket } from "./Bracket";

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
    for (const { format, name, sources } of this.ctx.bracketsStyle) {
      const inProgressStage = this.ctx.inProgressBrackets.find(
        (stage) => stage.name === name,
      );

      if (inProgressStage) {
        this.brackets.push(
          Bracket.create({
            preview: false,
            data: {
              ...this.data,
              match: this.data.match.filter(
                (match) => match.stage_id === inProgressStage.id,
              ),
              stage: this.data.stage.filter(
                (stage) => stage.id === inProgressStage.id,
              ),
              round: this.data.round.filter(
                (round) => round.stage_id === inProgressStage.id,
              ),
            },
            // xxx: type: format,
            type: inProgressStage.type,
          }),
        );
      } else {
        const manager = getTournamentManager("IN_MEMORY");
        const { teams, relevantMatchesFinished } = sources
          ? this.resolveTeamsFromSources(sources)
          : { teams: this.ctx.teams, relevantMatchesFinished: true };

        manager.create({
          tournamentId: this.ctx.id,
          name,
          // xxx: type: format,
          type: resolveTournamentStageType(format),
          seeding: fillWithNullTillPowerOfTwo(teams.map((team) => team.name)),
          settings: this.bracketSettings(format),
        });

        this.brackets.push(
          Bracket.create({
            preview: true,
            data: manager.get.stageData(0),
            // xxx: type: format,
            type: resolveTournamentStageType(format),
            canBeStarted:
              teams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START &&
              (sources ? relevantMatchesFinished : this.regularCheckInHasEnded),
          }),
        );
      }
    }
  }

  private resolveTeamsFromSources(
    sources: NonNullable<TournamentBracketsStyle[number]["sources"]>,
  ) {
    const teams: { id: number; name: string }[] = [];

    let allRelevantMatchesFinished = true;
    for (const { bracketIdx, placements } of sources) {
      const sourceBracket = this.bracketByIdx(bracketIdx);
      invariant(sourceBracket, "Bracket not found");

      const { teams: sourcedTeams, relevantMatchesFinished } =
        sourceBracket.source(placements);
      if (!relevantMatchesFinished) {
        allRelevantMatchesFinished = false;
      }
      teams.push(...sourcedTeams);
    }

    return { teams, relevantMatchesFinished: allRelevantMatchesFinished };
  }

  // xxx: type
  private bracketSettings(format: BracketFormat): Stage["settings"] {
    switch (format) {
      case "SE":
        return { consolationFinal: false };
      case "DE":
        return {
          grandFinal: "double",
        };
      // xxx: resolve from TO setting
      case "RR":
        return {
          groupCount: 4,
        };
      default: {
        assertUnreachable(format);
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

  canCheckInToBracket({
    user,
    bracketIdx,
  }: {
    user: OptionalIdObject;
    bracketIdx: number;
  }) {
    // regular check-in flow used
    if (bracketIdx === 0) return false;

    const team = this.teamMemberOfByUser(user);
    if (!team) return false;

    const bracket = this.bracketByIdx(bracketIdx);
    if (!bracket?.preview) return false;

    if (!bracket.data.participant.some((p) => p.name === team.name)) {
      return false;
    }

    if (team.checkIns.some((checkIn) => checkIn.bracketIdx === bracketIdx)) {
      return false;
    }

    return true;
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
  progress(_user: OptionalIdObject) {
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

  canCheckInToTournament(bracketIdx: number, user: OptionalIdObject) {
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

  ownedTeamByUser(
    user: OptionalIdObject,
  ): ((typeof this.ctx.teams)[number] & { inviteCode: string }) | null {
    if (!user) return null;

    return this.ctx.teams.find((team) =>
      team.members.some(
        (member) => member.userId === user.id && member.isOwner,
      ),
    ) as (typeof this.ctx.teams)[number] & { inviteCode: string };
  }

  teamMemberOfByUser(user: OptionalIdObject) {
    if (!user) return null;

    return this.ctx.teams.find((team) =>
      team.members.some((member) => member.userId === user.id),
    );
  }

  isOrganizer(user: OptionalIdObject) {
    if (!user) return false;
    if (isAdmin(user)) return true;

    return this.ctx.staff.some(
      (staff) => staff.id === user.id && staff.role === "ORGANIZER",
    );
  }

  isAdmin(user: OptionalIdObject) {
    if (!user) return false;
    if (isAdmin(user)) return true;

    return this.ctx.author.id === user.id;
  }
}
