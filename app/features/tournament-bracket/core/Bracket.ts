import invariant from "tiny-invariant";
import type { Tables, TournamentBracketProgression } from "~/db/tables";
import { TOURNAMENT } from "~/features/tournament";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import { assertUnreachable } from "~/utils/types";
import type { OptionalIdObject, Tournament } from "./Tournament";

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
}

class DoubleEliminationBracket extends Bracket {
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "double_elimination";
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
