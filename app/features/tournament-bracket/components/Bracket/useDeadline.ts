import { useTournament } from "~/features/tournament/routes/to.$id";
import {
  databaseTimestampToDate,
  dateToDatabaseTimestamp,
} from "~/utils/dates";
import type { Bracket } from "../../core/Bracket";
import type { Round } from "~/modules/brackets-model";
import { logger } from "~/utils/logger";

const MINUTES = {
  BO3: 30,
  BO5: 40,
  BO7: 50,
};

export function useDeadline(roundId: number, bestOf: 3 | 5 | 7) {
  const tournament = useTournament();

  const bracket = tournament.brackets.find((b) =>
    b.data.round.some((r) => r.id === roundId),
  );
  if (!bracket) return null;

  const roundIdx = bracket.data.round.findIndex((r) => r.id === roundId);
  const round = bracket.data.round[roundIdx];
  if (!round) return null;

  const isFirstRoundOfBracket = roundIdx === 0;

  const matches = bracket.data.match.filter((m) => m.round_id === roundId);
  const everyMatchHasStarted = matches.every(
    (m) =>
      (!m.opponent1 || m.opponent1.id) && (!m.opponent2 || m.opponent2?.id),
  );

  if (!everyMatchHasStarted) return null;

  let dl: Date | null;
  if (isFirstRoundOfBracket) {
    // should not happen
    if (!bracket.createdAt) return null;

    dl = databaseTimestampToDate(bracket.createdAt);
  } else {
    // xxx: round robin DL logic
    const losersGroupId = bracket.data.group.find((g) => g.number === 2)?.id;
    if (
      bracket.type === "single_elimination" ||
      round.group_id !== losersGroupId
    ) {
      dl = dateByPreviousRound(bracket, round);
    } else {
      dl = dateByPreviousRoundAndWinners(bracket, round);
    }
  }

  if (!dl) return null;

  dl.setMinutes(dl.getMinutes() + MINUTES[`BO${bestOf}`]);

  return dl;
}

function dateByPreviousRound(bracket: Bracket, round: Round) {
  const previousRound = bracket.data.round.find(
    (r) => r.number === round.number - 1 && round.group_id === r.group_id,
  );
  if (!previousRound) {
    logger.warn("Previous round not found", { bracket, round });
    return null;
  }

  let maxFinishedAt = 0;
  for (const match of bracket.data.match.filter(
    (m) => m.round_id === previousRound.id,
  )) {
    if (!match.opponent1 || !match.opponent2) {
      continue;
    }

    if (match.opponent1.result !== "win" && match.opponent2.result !== "win") {
      return null;
    }

    maxFinishedAt = Math.max(maxFinishedAt, match.lastGameFinishedAt ?? 0);
  }

  if (maxFinishedAt === 0) {
    return null;
  }

  return databaseTimestampToDate(maxFinishedAt);
}

function dateByPreviousRoundAndWinners(bracket: Bracket, round: Round) {
  const byPreviousRound =
    round.number > 1 ? dateByPreviousRound(bracket, round) : null;
  const winnersRound = bracket.winnersSourceRound(round.number);

  if (!winnersRound) return byPreviousRound;

  let maxFinishedAtWB = 0;
  for (const match of bracket.data.match.filter(
    (m) => m.round_id === winnersRound.id,
  )) {
    if (!match.opponent1 || !match.opponent2) {
      continue;
    }

    if (match.opponent1.result !== "win" && match.opponent2.result !== "win") {
      return null;
    }

    maxFinishedAtWB = Math.max(maxFinishedAtWB, match.lastGameFinishedAt ?? 0);
  }

  if (!byPreviousRound && !maxFinishedAtWB) return null;
  if (!byPreviousRound) return databaseTimestampToDate(maxFinishedAtWB);
  if (!maxFinishedAtWB) return byPreviousRound;

  return databaseTimestampToDate(
    Math.max(dateToDatabaseTimestamp(byPreviousRound), maxFinishedAtWB),
  );
}
