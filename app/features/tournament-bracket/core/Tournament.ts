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
import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";

export type OptionalIdObject = { id: number } | undefined;

/** Extends and providers utility functions on top of the bracket-manager library. Updating data after the bracket has started is responsibility of bracket-manager. */
export class Tournament {
  brackets: Bracket[] = [];
  ctx;

  constructor({ data, ctx }: TournamentData) {
    const hasStarted = ctx.inProgressBrackets.length > 0;
    this.ctx = {
      ...ctx,
      teams: hasStarted
        ? // after the start the teams who did not check-in are irrelevant
          ctx.teams.filter((team) => team.checkIns.length > 0)
        : ctx.teams,
      startTime: databaseTimestampToDate(ctx.startTime),
    };

    this.initBrackets(data);
  }

  private initBrackets(data: ValueToArray<DataTypes>) {
    for (const [
      bracketIdx,
      { type, name, sources },
    ] of this.ctx.settings.bracketProgression.entries()) {
      const inProgressStage = this.ctx.inProgressBrackets.find(
        (stage) => stage.name === name,
      );

      if (inProgressStage) {
        const match = data.match.filter(
          (match) => match.stage_id === inProgressStage.id,
        );
        const participants = new Set(
          match
            .flatMap((match) => [match.opponent1?.id, match.opponent2?.id])
            .filter(Boolean),
        );

        this.brackets.push(
          Bracket.create({
            id: inProgressStage.id,
            tournament: this,
            preview: false,
            name,
            data: {
              ...data,
              participant: data.participant.filter((participant) =>
                participants.has(participant.id),
              ),
              group: data.group.filter(
                (group) => group.stage_id === inProgressStage.id,
              ),
              match,
              stage: data.stage.filter(
                (stage) => stage.id === inProgressStage.id,
              ),
              round: data.round.filter(
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
          const seeding = checkedInTeams.map((team) => team.name);
          manager.create({
            tournamentId: this.ctx.id,
            name,
            type,
            seeding:
              type === "round_robin"
                ? seeding
                : fillWithNullTillPowerOfTwo(seeding),
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
        if (usesRegularCheckIn) {
          if (team.checkIns.length > 0 || !this.regularCheckInStartInThePast) {
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
      case "round_robin":
        return {
          // xxx: resolve from settings
          groupCount: 2,
          seedOrdering: ["groups.seed_optimized"],
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

  resolvePoolCode({ hostingTeamId }: { hostingTeamId: number }) {
    const prefix = this.ctx.name.includes("In The Zone")
      ? "ITZ"
      : HACKY_isInviteOnlyEvent(this.ctx)
        ? "SQ"
        : "PN";
    const lastDigit = hostingTeamId % 10;

    return { prefix, lastDigit };
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

  participatedPlayersByTeamId(id: number) {
    const team = this.teamById(id);
    invariant(team, "Team not found");

    return team.members.filter((member) =>
      this.ctx.participatedUsers.includes(member.userId),
    );
  }

  matchIdToBracketIdx(matchId: number) {
    const idx = this.brackets.findIndex((bracket) =>
      bracket.data.match.some((match) => match.id === matchId),
    );

    if (idx === -1) return null;

    return idx;
  }

  get standings() {
    for (const bracket of this.brackets) {
      if (bracket.name === BRACKET_NAMES.MAIN) {
        return bracket.standings;
      }

      // TODO: a bit more complex for RR->SE than this
      if (bracket.name === BRACKET_NAMES.FINALS) {
        return bracket.standings;
      }
    }

    logger.warn("Standings not found");
    return [];
  }

  canFinalize(user: OptionalIdObject) {
    return (
      this.everyBracketOver && this.isOrganizer(user) && !this.ctx.isFinalized
    );
  }

  canReportScore({
    matchId,
    user,
  }: {
    matchId: number;
    user: OptionalIdObject;
  }) {
    const match = this.brackets
      .flatMap((bracket) => (bracket.preview ? [] : bracket.data.match))
      .find((match) => match.id === matchId);
    invariant(match, "Match not found");

    // match didn't start yet
    if (!match.opponent1 || !match.opponent2) return false;

    const matchIsOver =
      match.opponent1.result === "win" || match.opponent2.result === "win";

    if (matchIsOver) return false;

    const teamMemberOf = this.teamMemberOfByUser(user)?.id;

    const isParticipant =
      match.opponent1.id === teamMemberOf ||
      match.opponent2.id === teamMemberOf;

    return isParticipant || this.isOrganizer(user);
  }

  // xxx: read from settings or HACKY
  get subsFeatureEnabled() {
    return true;
  }

  checkInConditionsFulfilled({
    tournamentTeamId,
    mapPool,
  }: {
    tournamentTeamId: number;
    mapPool: unknown[];
  }) {
    const team = this.teamById(tournamentTeamId);
    invariant(team, "Team not found");

    if (!this.regularCheckInIsOpen && !this.regularCheckInHasEnded) {
      return false;
    }

    if (team.members.length < TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
      return false;
    }

    if (mapPool.length === 0) {
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

  get regularCheckInStartInThePast() {
    return this.regularCheckInStartsAt < new Date();
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

  isOrganizerOrStreamer(user: OptionalIdObject) {
    if (!user) return false;
    if (isAdmin(user)) return true;

    return this.ctx.staff.some(
      (staff) =>
        staff.id === user.id && ["ORGANIZER", "STREAMER"].includes(staff.role),
    );
  }

  isAdmin(user: OptionalIdObject) {
    if (!user) return false;
    if (isAdmin(user)) return true;

    return this.ctx.author.id === user.id;
  }
}
