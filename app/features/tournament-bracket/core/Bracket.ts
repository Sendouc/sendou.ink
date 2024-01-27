import invariant from "tiny-invariant";
import type { Tables, TournamentBracketProgression } from "~/db/tables";
import { TOURNAMENT } from "~/features/tournament";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import { assertUnreachable } from "~/utils/types";
import type { OptionalIdObject, Tournament } from "./Tournament";
import type { TournamentDataTeam } from "./Tournament.server";
import { removeDuplicates } from "~/utils/arrays";
import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";
import { logger } from "~/utils/logger";

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

  get collectResultsWithPoints() {
    return false;
  }

  get type(): TournamentBracketProgression[number]["type"] {
    throw new Error("not implemented");
  }

  get standings(): Standing[] {
    throw new Error("not implemented");
  }

  protected standingsWithoutNonParticipants(standings: Standing[]): Standing[] {
    return standings.map((standing) => {
      return {
        ...standing,
        team: {
          ...standing.team,
          members: standing.team.members.filter((member) =>
            this.tournament.ctx.participatedUsers.includes(member.userId),
          ),
        },
      };
    });
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

    return this.standingsWithoutNonParticipants(result.reverse());
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

    return this.standingsWithoutNonParticipants(result.reverse());
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

  get collectResultsWithPoints() {
    return true;
  }

  source(placements: number[]): {
    relevantMatchesFinished: boolean;
    teams: { id: number; name: string }[];
  } {
    if (placements.some((p) => p < 0)) {
      throw new Error("Negative placements not implemented");
    }
    const standings = this.standings;
    const relevantMatchesFinished =
      standings.length === this.data.participant.length;

    return {
      relevantMatchesFinished,
      teams: standings
        .filter((s) => placements.includes(s.placement))
        .map((s) => ({ id: s.team.id, name: s.team.name })),
    };
  }

  get standings(): Standing[] {
    const groupIds = this.data.group.map((group) => group.id);

    const placements: (Standing & { groupId: number })[] = [];
    for (const groupId of groupIds) {
      const matches = this.data.match.filter(
        (match) => match.group_id === groupId,
      );

      const groupIsFinished = matches.every(
        (match) =>
          // BYE
          match.opponent1 === null ||
          match.opponent2 === null ||
          // match was played out
          match.opponent1?.result === "win" ||
          match.opponent2?.result === "win",
      );

      if (!groupIsFinished) continue;

      const teams: {
        id: number;
        setWins: number;
        setLosses: number;
        mapWins: number;
        mapLosses: number;
        winsAgainstTied: number;
        points: number;
      }[] = [];

      const updateTeam = ({
        teamId,
        setWins,
        setLosses,
        mapWins,
        mapLosses,
        points,
      }: {
        teamId: number;
        setWins: number;
        setLosses: number;
        mapWins: number;
        mapLosses: number;
        points: number;
      }) => {
        const team = teams.find((team) => team.id === teamId);
        if (team) {
          team.setWins += setWins;
          team.setLosses += setLosses;
          team.mapWins += mapWins;
          team.mapLosses += mapLosses;
          team.points += points;
        } else {
          teams.push({
            id: teamId,
            setWins,
            setLosses,
            mapWins,
            mapLosses,
            winsAgainstTied: 0,
            points,
          });
        }
      };

      for (const match of matches) {
        const winner =
          match.opponent1?.result === "win" ? match.opponent1 : match.opponent2;

        const loser =
          match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;

        if (!winner || !loser) continue;

        invariant(
          typeof winner.id === "number" &&
            typeof loser.id === "number" &&
            typeof winner.score === "number" &&
            typeof loser.score === "number",
        );

        if (
          typeof winner.totalPoints !== "number" ||
          typeof loser.totalPoints !== "number"
        ) {
          logger.warn(
            "RoundRobinBracket.standings: winner or loser points not found",
          );
        }

        updateTeam({
          teamId: winner.id,
          setWins: 1,
          setLosses: 0,
          mapWins: winner.score,
          mapLosses: loser.score,
          points: winner.totalPoints ?? 0,
        });
        updateTeam({
          teamId: loser.id,
          setWins: 0,
          setLosses: 1,
          mapWins: loser.score,
          mapLosses: winner.score,
          points: loser.totalPoints ?? 0,
        });
      }

      for (const team of teams) {
        for (const team2 of teams) {
          if (team.id === team2.id) continue;
          if (team.setWins !== team2.setWins) continue;

          // they are different teams and are tied, let's check who won

          const wonTheirMatch = matches.some(
            (match) =>
              (match.opponent1?.id === team.id &&
                match.opponent2?.id === team2.id &&
                match.opponent1?.result === "win") ||
              (match.opponent1?.id === team2.id &&
                match.opponent2?.id === team.id &&
                match.opponent2?.result === "win"),
          );

          if (wonTheirMatch) {
            team.winsAgainstTied++;
          }
        }
      }

      placements.push(
        ...teams
          .sort((a, b) => {
            if (a.setWins > b.setWins) return -1;
            if (a.setWins < b.setWins) return 1;

            if (a.winsAgainstTied > b.winsAgainstTied) return -1;
            if (a.winsAgainstTied < b.winsAgainstTied) return 1;

            if (a.mapWins > b.mapWins) return -1;
            if (a.mapWins < b.mapWins) return 1;

            if (a.points > b.points) return -1;
            if (a.points < b.points) return 1;

            const aSeed = Number(this.tournament.seedByTeamId(a.id));
            const bSeed = Number(this.tournament.seedByTeamId(b.id));

            if (aSeed < bSeed) return -1;
            if (aSeed > bSeed) return 1;

            return 0;
          })
          .map((team, i) => {
            return {
              team: this.tournament.teamById(team.id)!,
              placement: i + 1,
              groupId,
            };
          }),
      );
    }

    return placements.sort((a, b) => {
      if (a.placement < b.placement) return -1;
      if (a.placement > b.placement) return 1;

      if (a.groupId < b.groupId) return -1;
      if (a.groupId > b.groupId) return 1;

      return 0;
    });
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "round_robin";
  }
}
