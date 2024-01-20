import invariant from "tiny-invariant";
import type { TournamentBracketProgression } from "~/db/tables";
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
import { fillWithNullTillPowerOfTwo } from "../tournament-bracket-utils";
import type { Stage } from "~/modules/brackets-model";
import { Bracket } from "./Bracket";

export type OptionalIdObject = { id: number } | undefined;

/** Extends and providers utility functions on top of the bracket-manager library. Updating data after the bracket has started is responsibility of bracket-manager. */
export class Tournament {
  private data: ValueToArray<DataTypes>;
  private brackets: Bracket[] = [];
  ctx;

  constructor({ data, ctx }: TournamentData) {
    this.data = data;

    const hasStarted = ctx.inProgressBrackets.length > 0;
    this.ctx = {
      ...ctx,
      teams: hasStarted
        ? // after the start the teams who did not check-in are irrelevant
          ctx.teams.filter((team) => team.checkIns.length > 0)
        : ctx.teams,
      startTime: databaseTimestampToDate(ctx.startTime),
    };

    this.initBrackets();
  }

  private initBrackets() {
    for (const [
      bracketIdx,
      { type, name, sources },
    ] of this.ctx.settings.bracketProgression.entries()) {
      const inProgressStage = this.ctx.inProgressBrackets.find(
        (stage) => stage.name === name,
      );

      if (inProgressStage) {
        this.brackets.push(
          Bracket.create({
            id: inProgressStage.id,
            tournament: this,
            preview: false,
            name,
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
            type,
          }),
        );
      } else {
        const manager = getTournamentManager("IN_MEMORY");
        const { teams, relevantMatchesFinished } = sources
          ? this.resolveTeamsFromSources(sources)
          : {
              teams: this.ctx.teams,
              relevantMatchesFinished: true,
            };

        const { checkedInTeams, notCheckedInTeams } =
          this.divideTeamsToCheckedInAndNotCheckedIn({
            teams,
            bracketIdx,
          });

        if (checkedInTeams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START) {
          manager.create({
            tournamentId: this.ctx.id,
            name,
            type,
            seeding: fillWithNullTillPowerOfTwo(
              checkedInTeams.map((team) => team.name),
            ),
            settings: this.bracketSettings(type),
          });
        }

        this.brackets.push(
          Bracket.create({
            id: -1 * bracketIdx,
            tournament: this,
            preview: true,
            name,
            data: manager.get.tournamentData(this.ctx.id),
            type,
            canBeStarted:
              checkedInTeams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START &&
              (sources ? relevantMatchesFinished : this.regularCheckInHasEnded),
            teamsPendingCheckIn:
              bracketIdx !== 0 ? notCheckedInTeams.map((t) => t.id) : undefined,
          }),
        );
      }
    }
  }

  private resolveTeamsFromSources(
    sources: NonNullable<TournamentBracketProgression[number]["sources"]>,
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

  private divideTeamsToCheckedInAndNotCheckedIn({
    teams,
    bracketIdx,
  }: {
    teams: { id: number; name: string }[];
    bracketIdx: number;
  }) {
    return teams.reduce(
      (acc, cur) => {
        const team = this.teamById(cur.id);
        invariant(team, "Team not found");

        const usesRegularCheckIn = bracketIdx === 0;
        const regularCheckInHasBeenPossible =
          this.regularCheckInIsOpen || this.regularCheckInHasEnded;
        if (usesRegularCheckIn) {
          if (team.checkIns.length > 0 || !regularCheckInHasBeenPossible) {
            acc.checkedInTeams.push(cur);
          } else {
            acc.notCheckedInTeams.push(cur);
          }
        } else {
          if (
            team.checkIns.some((checkIn) => checkIn.bracketIdx === bracketIdx)
          ) {
            acc.checkedInTeams.push(cur);
          } else {
            acc.notCheckedInTeams.push(cur);
          }
        }

        return acc;
      },
      { checkedInTeams: [], notCheckedInTeams: [] } as {
        checkedInTeams: { id: number; name: string }[];
        notCheckedInTeams: { id: number; name: string }[];
      },
    );
  }

  bracketSettings(
    type: TournamentBracketProgression[number]["type"],
  ): Stage["settings"] {
    switch (type) {
      case "single_elimination":
        return { consolationFinal: false };
      case "double_elimination":
        return {
          grandFinal: "double",
        };
      // xxx: resolve from TO setting
      case "round_robin":
        return {
          groupCount: 4,
        };
      default: {
        assertUnreachable(type);
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
