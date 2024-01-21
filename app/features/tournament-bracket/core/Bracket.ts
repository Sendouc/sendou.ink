import invariant from "tiny-invariant";
import type { Tables, TournamentBracketProgression } from "~/db/tables";
import { TOURNAMENT } from "~/features/tournament";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import { assertUnreachable } from "~/utils/types";
import type { OptionalIdObject, Tournament } from "./Tournament";
import type { TournamentDataTeam } from "./Tournament.server";
import { removeDuplicates } from "~/utils/arrays";
import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";

interface CreateBracketArgs {
  id: number;
  preview: boolean;
  data: ValueToArray<DataTypes>;
  type: Tables["TournamentStage"]["type"];
  canBeStarted?: boolean;
  name: string;
  teamsPendingCheckIn?: number[];
  tournament: Tournament;
}

export interface Standing {
  team: TournamentDataTeam;
  placement: number; // 1st, 2nd, 3rd, 4th, 5th, 5th...
}

export abstract class Bracket {
  id;
  preview;
  data;
  canBeStarted;
  name;
  teamsPendingCheckIn;
  tournament;

  constructor({
    id,
    preview,
    data,
    canBeStarted,
    name,
    teamsPendingCheckIn,
    tournament,
  }: Omit<CreateBracketArgs, "format">) {
    this.id = id;
    this.preview = preview;
    this.data = data;
    this.canBeStarted = canBeStarted;
    this.name = name;
    this.teamsPendingCheckIn = teamsPendingCheckIn;
    this.tournament = tournament;
  }

  get type(): TournamentBracketProgression[number]["type"] {
    throw new Error("not implemented");
  }

  get standings(): Standing[] {
    throw new Error("not implemented");
  }

  get isUnderground() {
    return this.name === BRACKET_NAMES.UNDERGROUND;
  }

  get everyMatchOver() {
    if (this.preview) return false;

    for (const match of this.data.match) {
      // BYE
      if (match.opponent1 === null || match.opponent2 === null) {
        continue;
      }
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        return false;
      }
    }

    return true;
  }

  get enoughTeams() {
    return this.data.participant.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START;
  }

  canCheckIn(user: OptionalIdObject) {
    // using regular check-in
    if (!this.teamsPendingCheckIn) return false;

    const team = this.tournament.ownedTeamByUser(user);
    if (!team) return false;

    return this.teamsPendingCheckIn.includes(team.id);
  }

  source(_placements: number[]): {
    relevantMatchesFinished: boolean;
    teams: { id: number; name: string }[];
  } {
    throw new Error("not implemented");
  }

  teamsWithNames(teams: { id: number }[]) {
    return teams.map((team) => {
      const name = this.data.participant.find(
        (participant) => participant.id === team.id,
      )?.name;
      invariant(name, `Team name not found for id: ${team.id}`);

      return {
        id: team.id,
        name,
      };
    });
  }

  static create(
    args: CreateBracketArgs,
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
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "single_elimination";
  }

  get standings(): Standing[] {
    const teams: { id: number; lostAt: number }[] = [];

    for (const match of this.data.match
      .slice()
      .sort((a, b) => a.round_id - b.round_id)) {
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        continue;
      }

      const loser =
        match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
      invariant(loser?.id, "Loser id not found");

      teams.push({ id: loser.id, lostAt: match.round_id });
    }

    const teamCountWhoDidntLoseYet =
      this.data.participant.length - teams.length;

    const result: Standing[] = [];
    for (const roundId of removeDuplicates(teams.map((team) => team.lostAt))) {
      const teamsLostThisRound: { id: number }[] = [];
      while (teams.length && teams[0].lostAt === roundId) {
        teamsLostThisRound.push(teams.shift()!);
      }

      for (const { id: teamId } of teamsLostThisRound) {
        const team = this.tournament.teamById(teamId);
        invariant(team, `Team not found for id: ${teamId}`);

        const teamsPlacedAbove = teamCountWhoDidntLoseYet + teams.length;

        result.push({
          team,
          placement: teamsPlacedAbove + 1,
        });
      }
    }

    if (teamCountWhoDidntLoseYet === 1) {
      const winner = this.data.participant.find((participant) =>
        result.every(({ team }) => team.id !== participant.id),
      );
      invariant(winner, "No winner identified");

      const winnerTeam = this.tournament.teamById(winner.id);
      invariant(winnerTeam, `Winner team not found for id: ${winner.id}`);

      result.push({
        team: winnerTeam,
        placement: 1,
      });
    }

    // TODO: 3rd place match

    return result.reverse();
  }
}

class DoubleEliminationBracket extends Bracket {
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "double_elimination";
  }

  get standings(): Standing[] {
    const losersGroupId = this.data.group.find((g) => g.number === 2)?.id;
    invariant(losersGroupId, "Losers group not found");

    const teams: { id: number; lostAt: number }[] = [];

    for (const match of this.data.match
      .slice()
      .sort((a, b) => a.round_id - b.round_id)) {
      if (match.group_id !== losersGroupId) continue;

      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        continue;
      }

      const loser =
        match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
      invariant(loser?.id, "Loser id not found");

      teams.push({ id: loser.id, lostAt: match.round_id });
    }

    const teamCountWhoDidntLoseInLosersYet =
      this.data.participant.length - teams.length;

    const result: Standing[] = [];
    for (const roundId of removeDuplicates(teams.map((team) => team.lostAt))) {
      const teamsLostThisRound: { id: number }[] = [];
      while (teams.length && teams[0].lostAt === roundId) {
        teamsLostThisRound.push(teams.shift()!);
      }

      for (const { id: teamId } of teamsLostThisRound) {
        const team = this.tournament.teamById(teamId);
        invariant(team, `Team not found for id: ${teamId}`);

        const teamsPlacedAbove =
          teamCountWhoDidntLoseInLosersYet + teams.length;

        result.push({
          team,
          placement: teamsPlacedAbove + 1,
        });
      }
    }

    const grandFinalsGroupId = this.data.group.find((g) => g.number === 3)?.id;
    invariant(grandFinalsGroupId, "GF group not found");
    const grandFinalMatches = this.data.match.filter(
      (match) => match.group_id === grandFinalsGroupId,
    );
    invariant(grandFinalMatches.length === 2, "GF matches incorrect amount");

    // if opponent1 won it means that bracket reset is not played
    if (grandFinalMatches[0].opponent1?.result === "win") {
      const loserTeam = this.tournament.teamById(
        grandFinalMatches[0].opponent2!.id!,
      );
      invariant(loserTeam, "Loser team not found");
      const winnerTeam = this.tournament.teamById(
        grandFinalMatches[0].opponent1.id!,
      );
      invariant(winnerTeam, "Winner team not found");

      result.push({
        team: loserTeam,
        placement: 2,
      });

      result.push({
        team: winnerTeam,
        placement: 1,
      });
    } else if (
      grandFinalMatches[1].opponent1?.result === "win" ||
      grandFinalMatches[1].opponent2?.result === "win"
    ) {
      const loser =
        grandFinalMatches[1].opponent1?.result === "win"
          ? "opponent2"
          : "opponent1";
      const winner = loser === "opponent1" ? "opponent2" : "opponent1";

      const loserTeam = this.tournament.teamById(
        grandFinalMatches[1][loser]!.id!,
      );
      invariant(loserTeam, "Loser team not found");
      const winnerTeam = this.tournament.teamById(
        grandFinalMatches[1][winner]!.id!,
      );
      invariant(winnerTeam, "Winner team not found");

      result.push({
        team: loserTeam,
        placement: 2,
      });

      result.push({
        team: winnerTeam,
        placement: 1,
      });
    }

    return result.reverse();
  }

  get everyMatchOver() {
    if (this.preview) return false;

    let lastWinner = -1;
    for (const [i, match] of this.data.match.entries()) {
      // special case - bracket reset might not be played depending on who wins in the grands
      const isLast = i === this.data.match.length - 1;
      if (isLast && lastWinner === 1) {
        continue;
      }
      // BYE
      if (match.opponent1 === null || match.opponent2 === null) {
        continue;
      }
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        return false;
      }

      lastWinner = match.opponent1?.result === "win" ? 1 : 2;
    }

    return true;
  }

  source(placements: number[]) {
    const resolveLosersGroupId = (data: ValueToArray<DataTypes>) => {
      const minGroupId = Math.min(...data.round.map((round) => round.group_id));

      return minGroupId + 1;
    };
    const placementsToRoundsIds = (
      data: ValueToArray<DataTypes>,
      groupId: number,
    ) => {
      const losersRounds = data.round.filter(
        (round) => round.group_id === groupId,
      );
      const orderedRoundsIds = losersRounds
        .map((round) => round.id)
        .sort((a, b) => a - b);
      const amountOfRounds = Math.abs(Math.min(...placements));
      return orderedRoundsIds.slice(0, amountOfRounds);
    };

    invariant(
      placements.every((placement) => placement < 0),
      "Positive placements in DE not implemented",
    );

    const losersGroupId = resolveLosersGroupId(this.data);
    const sourceRoundsIds = placementsToRoundsIds(
      this.data,
      losersGroupId,
    ).sort(
      // teams who made it further in the bracket get higher seed
      (a, b) => b - a,
    );

    const teams: { id: number }[] = [];
    let relevantMatchesFinished = true;
    for (const roundId of sourceRoundsIds) {
      const roundsMatches = this.data.match.filter(
        (match) => match.round_id === roundId,
      );

      for (const match of roundsMatches) {
        if (
          match.opponent1?.result !== "win" &&
          match.opponent2?.result !== "win"
        ) {
          relevantMatchesFinished = false;
          continue;
        }

        const loser =
          match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
        invariant(loser?.id, "Loser id not found");

        teams.push({ id: loser.id });
      }
    }

    return {
      relevantMatchesFinished,
      teams: this.teamsWithNames(teams),
    };
  }
}

class RoundRobinBracket extends Bracket {
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "round_robin";
  }
}
