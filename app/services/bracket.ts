import type { Prisma } from ".prisma/client";
import type { Stage, TeamOrder } from ".prisma/client";
import invariant from "tiny-invariant";
import {
  EliminationBracketSide,
  losersRoundNames,
  winnersRoundNames,
} from "~/core/tournament/bracket";
import { canReportMatchScore } from "~/core/tournament/permissions";
import { matchIsOver } from "~/core/tournament/utils";
import { BracketData } from "~/hooks/useBracketDataWithEvents";
import * as TournamentBracket from "~/models/TournamentBracket.server";
import * as TournamentMatch from "~/models/TournamentMatch.server";
import { Unpacked } from "~/utils";
import { db } from "~/utils/db.server";

export type BracketModified = {
  id: string;
  rounds: BracketModifiedSide;
};

type BracketModifiedSide = {
  id: string;
  name: string;
  stages: { position: number; stage: Stage }[];
  side?: EliminationBracketSide;
  matches: {
    id: string;
    number: number;
    score?: [upperTeamScore: number, lowerTeamScore: number];
    participants?: [upperTeamName: string | null, lowerTeamName: string | null];
    participantSourceMatches?: [
      upperTeamSourceMatchNumber: number | null,
      lowerTeamSourceMatchNumber: number | null
    ];
    winnerDestinationMatchId: string | null;
    loserDestinationMatchId: string | null;
  }[];
}[];

export async function bracketById(bracketId: string): Promise<BracketModified> {
  const bracket = await TournamentBracket.findById(bracketId);

  if (!bracket) throw new Response("No bracket found", { status: 404 });

  const winnersRounds = bracket.rounds
    .filter((round) => round.position > 0)
    .sort((a, b) => a.position - b.position);

  const losersRounds = bracket.rounds
    .filter((round) => round.position < 0)
    .sort((a, b) => b.position - a.position);

  const winners = modifyRounds(
    winnersRounds,
    "winners",
    losersRounds.length === 0
  );
  const losers = addLoserTeamSourceInfo({
    winners,
    losers: modifyRounds(losersRounds, "losers", false),
  });
  const rounds = winners
    .map((round) => ({ ...round, side: "winners" as EliminationBracketSide }))
    .concat(losers.map((round) => ({ ...round, side: "losers" })));

  return {
    id: bracketId,
    rounds,
  };
}

// TODO: rename
function modifyRounds(
  rounds: NonNullable<TournamentBracket.FindById>["rounds"],
  side: EliminationBracketSide,
  isSE: boolean
): BracketModifiedSide {
  const roundNames =
    side === "winners"
      ? winnersRoundNames(rounds.length, isSE)
      : losersRoundNames(rounds.length);
  return rounds.map((round, i) => {
    return {
      id: round.id,
      name: roundNames[i],
      stages: round.stages,
      matches: round.matches.map((match) => {
        const score =
          match.participants.length === 2
            ? match.results.reduce(
                (scores: [number, number], result) => {
                  if (result.winner === "UPPER") scores[0]++;
                  else scores[1]++;

                  return scores;
                },
                [0, 0]
              )
            : undefined;
        const participants: [string | null, string | null] | undefined =
          match.participants.length > 0
            ? [
                match.participants.find((p) => p.order === "UPPER")?.team
                  .name ?? null,
                match.participants.find((p) => p.order === "LOWER")?.team
                  .name ?? null,
              ]
            : undefined;
        return {
          // TODO: match.number could be made mandatory in DB and this would become redundant
          number: match.number ?? match.position,
          id: match.id,
          winnerDestinationMatchId: match.winnerDestinationMatchId,
          loserDestinationMatchId: match.loserDestinationMatchId,
          score,
          participants,
        };
      }),
    };
  });
}

export function addLoserTeamSourceInfo({
  winners,
  losers,
}: {
  winners: BracketModifiedSide;
  losers: BracketModifiedSide;
}): BracketModifiedSide {
  const nextMatchAfterBye = (id: string) => {
    const match = losers
      .flatMap((round) => round.matches)
      .find((match) => match.id === id);
    if (!match) return;
    if (match.number !== 0) return;

    return match.winnerDestinationMatchId;
  };

  const matchIdToSourceMatchNumbers = winners
    .flatMap((round) => round.matches)
    .reduce((acc: Map<string, number[]>, match) => {
      if (!match.loserDestinationMatchId) return acc;
      if (match.number === 0) return acc;

      const nextMatchAfterByeId = nextMatchAfterBye(
        match.loserDestinationMatchId
      );
      if (nextMatchAfterByeId) {
        acc.set(
          nextMatchAfterByeId,
          (acc.get(match.loserDestinationMatchId) ?? [])
            .concat(match.number)
            .sort((a, b) => a - b)
        );
      } else {
        acc.set(
          match.loserDestinationMatchId,
          (acc.get(match.loserDestinationMatchId) ?? [])
            .concat(match.number)
            .sort((a, b) => a - b)
        );
      }

      return acc;
    }, new Map());

  return losers.map((round) => ({
    ...round,
    matches: round.matches.map((match) => {
      const sourceMatches = matchIdToSourceMatchNumbers.get(match.id);
      return {
        ...match,
        participantSourceMatches: sourceMatches
          ? [sourceMatches[0] ?? null, sourceMatches[1] ?? null]
          : undefined,
      };
    }),
  }));
}

export async function reportScore({
  userId,
  winnerTeamId,
  matchId,
  playerIds,
  position,
  bracketId,
}: {
  userId: string;
  winnerTeamId: string;
  matchId: string;
  playerIds: string[];
  position: number;
  bracketId: string;
}): Promise<BracketData | undefined> {
  const match = await TournamentMatch.findById(matchId);

  //#region check validity of request
  if (!match) throw new Response("Invalid match id", { status: 400 });
  if (
    !canReportMatchScore({
      userId,
      members: match.participants.flatMap((p) => p.team.members),
    })
  ) {
    throw new Response("No permissions to report score", { status: 401 });
  }

  if (position <= match.results.length) {
    // no throw so it's handled gracefully if both teams report the score at the same time
    return;
  }
  if (
    matchIsOver(match.round.stages.length, matchResultsToTuple(match.results))
  ) {
    throw new Response("Match is already over", { status: 400 });
  }

  const winnerTeam = match.participants.find((p) => p.teamId === winnerTeamId);
  if (!winnerTeam) {
    throw new Response("Invalid winner team id", { status: 400 });
  }

  const stage = match.round.stages.find((stage) => stage.position === position);
  invariant(stage, "stage is undefined");
  //#endregion

  // advance tournament after reporting score if match is over
  const newScore = matchResultsToTuple(
    match.results
      .map((r) => ({ winner: r.winner }))
      .concat([{ winner: winnerTeam.order }])
  );
  if (matchIsOver(match.round.stages.length, newScore)) {
    const loserTeam = match.participants.find((p) => p.teamId !== winnerTeamId);
    invariant(loserTeam, "loserTeamId is undefined");

    const bracket = await TournamentBracket.findById(bracketId);
    if (!bracket) throw new Response("Invalid bracket id", { status: 400 });

    const newParticipants = newParticipantsForMatches({
      bracket,
      match,
      loserTeam,
      winnerTeam,
    });
    await db.$transaction([
      TournamentMatch.createResult({
        matchId,
        playerIds,
        roundStageId: stage.id,
        reporterId: userId,
        winner: winnerTeam.order,
      }),
      // todo: bracket reset
      TournamentMatch.createParticipants(newParticipants),
    ]);

    const upperParticipant = match.participants.find(
      (p) => p.order === "UPPER"
    );
    const lowerParticipant = match.participants.find(
      (p) => p.order === "LOWER"
    );
    return [
      {
        // TODO: can be removed when we make number mandatory in DB
        number: match.number!,
        participants:
          upperParticipant?.team.name || lowerParticipant?.team.name
            ? [
                upperParticipant?.team.name ?? null,
                lowerParticipant?.team.name ?? null,
              ]
            : undefined,
        score: newScore,
      },
      ...newParticipantsToBracketData(newParticipants, bracket),
    ];
    // otherwise if set is not over simply create result and return
  } else {
    await TournamentMatch.createResult({
      matchId,
      playerIds,
      roundStageId: stage.id,
      reporterId: userId,
      winner: winnerTeam.order,
    });

    const upperParticipant = match.participants.find(
      (p) => p.order === "UPPER"
    );
    const lowerParticipant = match.participants.find(
      (p) => p.order === "LOWER"
    );

    return [
      {
        // TODO: can be removed when we make number mandatory in DB
        number: match.number!,
        participants:
          upperParticipant?.team.name || lowerParticipant?.team.name
            ? [
                upperParticipant?.team.name ?? null,
                lowerParticipant?.team.name ?? null,
              ]
            : undefined,
        score: newScore,
      },
    ];
  }
}

function resolveNewOrder({
  bracket,
  oldMatch,
  newMatchId,
}: {
  bracket: NonNullable<TournamentBracket.FindById>;
  oldMatch: { id: string };
  newMatchId: string;
}): TeamOrder {
  const allMatches = bracket.rounds.flat().flatMap((round) => {
    return round.matches.map((match) => ({
      ...match,
      isWinners: round.position > 0,
    }));
  });

  const newMatch = allMatches.find((m) => m.id === newMatchId);
  invariant(newMatch, "newMatch is undefined");

  const matchesThatLeadToNewMatch = allMatches
    .filter((m) =>
      [m.loserDestinationMatchId, m.winnerDestinationMatchId].includes(
        newMatchId
      )
    )
    .sort((a, b) => {
      // first let's put teams from winners above teams from losers
      // this might come to question if losers match is bye (so position 0)
      // and would thus be above the winners bracket match if not for
      // this condition
      if (a.isWinners !== b.isWinners) {
        return Number(b.isWinners) - Number(a.isWinners);
      }

      // otherwise if match number is smaller it
      // should mean the match is above the other match.
      return a.position - b.position;
    });
  invariant(
    matchesThatLeadToNewMatch.length === 2,
    `matchesThatLeadToNewMatch length was unexpected: ${matchesThatLeadToNewMatch.length}`
  );
  invariant(
    matchesThatLeadToNewMatch.find((m) => m.id === oldMatch.id),
    "oldMatch not among matchesThatLeadToNewMatch"
  );

  if (matchesThatLeadToNewMatch[0].id === oldMatch.id) return "UPPER";
  return "LOWER";
}

function newParticipantsForMatches({
  bracket,
  match,
  winnerTeam,
  loserTeam,
}: {
  bracket: NonNullable<TournamentBracket.FindById>;
  match: NonNullable<TournamentMatch.FindById>;
  winnerTeam: Unpacked<NonNullable<TournamentMatch.FindById>["participants"]>;
  loserTeam: Unpacked<NonNullable<TournamentMatch.FindById>["participants"]>;
}): TournamentMatch.CreateParticipantsData {
  const result: TournamentMatch.CreateParticipantsData = [];

  if (match.winnerDestinationMatchId) {
    result.push({
      matchId: match.winnerDestinationMatchId,
      order: resolveNewOrder({
        bracket,
        oldMatch: match,
        newMatchId: match.winnerDestinationMatchId,
      }),
      teamId: winnerTeam.teamId,
    });
  }

  if (match.loserDestinationMatchId) {
    result.push({
      matchId: match.loserDestinationMatchId,
      order: resolveNewOrder({
        bracket,
        oldMatch: match,
        newMatchId: match.loserDestinationMatchId,
      }),
      teamId: loserTeam.teamId,
    });

    const losersMatch = bracket.rounds
      .flatMap((round) => round.matches)
      .find(({ id }) => id === match.loserDestinationMatchId);
    invariant(losersMatch, "losersMatch undefined");

    // if the match will have a BYE then we need to generate one more participant
    if (losersMatch.number === 0) {
      invariant(
        losersMatch.winnerDestinationMatchId,
        "losersMatch.winnerDestinationMatchId undefined"
      );
      result.push({
        matchId: losersMatch.winnerDestinationMatchId,
        order: resolveNewOrder({
          bracket,
          oldMatch: losersMatch,
          newMatchId: losersMatch.winnerDestinationMatchId,
        }),
        teamId: loserTeam.teamId,
      });
    }
  }

  return result;
}

function newParticipantsToBracketData(
  data: TournamentMatch.CreateParticipantsData,
  bracket: TournamentBracket.FindById
): BracketData {
  const result: BracketData = [];

  for (const participant of data) {
    const matches = bracket?.rounds.flatMap((r) => r.matches);
    const match = matches?.find((match) => match.id === participant.matchId);
    invariant(matches && match, "match is undefined");

    const allParticipants = matches.flatMap((m) => m.participants);

    const participants = (): NonNullable<
      Unpacked<BracketData>["participants"]
    > => {
      let upper =
        match.participants.find((p) => p.order === "UPPER")?.team.name ?? null;
      let lower =
        match.participants.find((p) => p.order === "LOWER")?.team.name ?? null;

      const newParticipant = allParticipants.find(
        (p) => p.team.id === participant.teamId
      );
      invariant(newParticipant, "newParticipant is undefined");

      if (participant.order === "UPPER") upper = newParticipant.team.name;
      else lower = newParticipant.team.name;

      return [upper, lower];
    };

    result.push({
      // TODO: can be removed when we make number mandatory in DB
      number: match.number!,
      participants: participants(),
      score: participants().filter(Boolean).length > 1 ? [0, 0] : null,
    });
  }

  return result;
}

export async function undoLastScore({
  matchId,
  position,
  userId,
}: {
  matchId: string;
  position: number;
  userId: string;
}): Promise<BracketData | undefined> {
  const match = await TournamentMatch.findById(matchId);
  if (!match) throw new Response("Invalid match id", { status: 400 });
  if (
    !canReportMatchScore({
      userId,
      members: match.participants.flatMap((p) => p.team.members),
    })
  ) {
    throw new Response("No permissions to undo score", { status: 401 });
  }

  if (
    matchIsOver(match.round.stages.length, matchResultsToTuple(match.results))
  ) {
    throw new Response("Match is already over", { status: 400 });
  }

  const resultToUndo = match.results[position - 1];
  if (!resultToUndo) {
    // let's assume the match was already undone instead of erroring
    return;
  }

  await TournamentMatch.deleteResult(resultToUndo.id);

  const upperParticipant = match.participants.find((p) => p.order === "UPPER");
  const lowerParticipant = match.participants.find((p) => p.order === "LOWER");
  const newScore = matchResultsToTuple(
    match.results
      .filter((result) => result.id !== resultToUndo.id)
      .map((r) => ({ winner: r.winner }))
  );

  return [
    {
      // TODO: can be removed when we make number mandatory in DB
      number: match.number!,
      participants:
        upperParticipant?.team.name || lowerParticipant?.team.name
          ? [
              upperParticipant?.team.name ?? null,
              lowerParticipant?.team.name ?? null,
            ]
          : undefined,
      score: newScore,
    },
  ];
}

function matchResultsToTuple(results: { winner: TeamOrder }[]) {
  return results.reduce(
    (acc: [number, number], result) => {
      if (result.winner === "UPPER") acc[0]++;
      else acc[1]++;
      return acc;
    },
    [0, 0]
  );
}

// TODO: figure out better convention.. in tournament file we serialize here we don't
export type MatchByIdI = Prisma.PromiseReturnType<typeof matchById>;
export const matchById = async (id: string) => {
  const match = await TournamentMatch.findById(id);
  if (!match) {
    throw new Response("Invalid match id", { status: 404 });
  }

  return match;
};
