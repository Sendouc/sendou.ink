import invariant from "tiny-invariant";

/** Singe/Double Elimination bracket algorithm that handles byes
 * @link https://stackoverflow.com/a/59615574 */
export function eliminationBracket(
  participantCount: number,
  type: "SE" | "DE"
) {
  let participants: TeamIdentifier[] = new Array(participantCount)
    .fill(null)
    .map((_, i) => i + 1);

  fillParticipantsWithNullTillPowerOfTwo(participants);

  const matchesWQueue: Match[] = [];
  const matchesLQueue: Match[] = [];
  const backfillQ: Match[] = [];

  invariant(
    powerOf2(participants.length),
    "Unexpected participants length not power of two"
  );
  const bracket: Bracket = {
    winners: [],
    losers: [],
    participantCount,
    participantsWithByesCount: participants.length,
  };

  const bracketSize = participants.length;
  const seedList = seeds(bracketSize);
  const seedTuples: [TeamIdentifier, number][] = participants.map((p, i) => [
    p,
    i + 1,
  ]);
  participants = seedTuples
    .sort(([_a, ai], [_b, bi]) => seedList.indexOf(ai) - seedList.indexOf(bi))
    .map(([p]) => p);

  // First round
  for (let i = 1; i <= bracketSize / 2; i++) {
    const upperTeam = participants.pop();
    const lowerTeam = participants.pop();
    invariant(
      typeof upperTeam !== "undefined",
      "Unexpected team1 is undefined in first round"
    );
    invariant(
      typeof lowerTeam !== "undefined",
      "Unexpected team1 is undefined in first round"
    );
    invariant(
      !(upperTeam === "BYE" && lowerTeam === "BYE"),
      "Unexpected both teams in the first round are BYEs"
    );
    const firstRoundMatch = createMatch({
      upperTeam,
      lowerTeam,
    });

    matchesWQueue.push(firstRoundMatch);
    matchesLQueue.push(firstRoundMatch);
    bracket.winners.push(firstRoundMatch);
  }

  // Generate winners bracket matches
  while (matchesWQueue.length > 1) {
    const match1 = matchesWQueue.shift();
    const match2 = matchesWQueue.shift();
    invariant(match1, "Unexpected no match1 in winners bracket");
    invariant(match2, "Unexpected no match2 in winners bracket");

    const winnersBracketMatch = createMatch({
      match1,
      match2,
    });

    matchesWQueue.push(winnersBracketMatch);
    bracket.winners.push(winnersBracketMatch);
    // add match to backfill for Lower Queue
    backfillQ.push(winnersBracketMatch);
  }

  if (type === "SE") return bracket;

  let roundSwitch = bracketSize / 2;
  let switcher = false;
  let counter = 0;
  let switchedCounter = 0;

  // Generate losers bracket matches
  while (matchesLQueue.length > 0 && backfillQ.length > 0) {
    let match1: Match | undefined;
    let match2: Match | undefined;

    if (switcher) {
      match1 = matchesLQueue.shift();
      match2 = backfillQ.shift();
      switchedCounter += 2;
      if (switchedCounter === roundSwitch) {
        // switch back
        roundSwitch /= 2;
        switcher = false;
        // reset counters
        switchedCounter = 0;
      }
    } else {
      match1 = matchesLQueue.shift();
      match2 = matchesLQueue.shift();
      counter += 2;
      if (counter === roundSwitch) {
        switcher = true;
        counter = 0;
      }
    }

    invariant(match1, "Unexpected no match1 in losers bracket");
    invariant(match2, "Unexpected no match2 in losers bracket");

    const losersMatch = createMatch({
      match1,
      match2,
    });

    matchesLQueue.push(losersMatch);
    bracket.losers.push(losersMatch);
  }

  const match1 = matchesWQueue.shift();
  const match2 = matchesLQueue.shift();

  invariant(match1, "Unexpected no match1 in final match");
  invariant(match2, "Unexpected no match2 in final match");

  // Add final match
  bracket.winners.push(
    createMatch({
      match1,
      match2,
    })
  );

  return bracket;
}

export function fillParticipantsWithNullTillPowerOfTwo(
  participants: TeamIdentifier[]
) {
  while (!powerOf2(participants.length)) {
    participants.push("BYE");
  }
}

/** @link https://stackoverflow.com/a/30924333 */
function powerOf2(v: number) {
  return v && !(v & (v - 1));
}

function seeds(numberOfTeamsWithByes: number) {
  const result: number[] = [];

  const limit = getBaseLog(2, numberOfTeamsWithByes) + 1;
  invariant(Number.isInteger(limit), "Unexpected limit is not an integer");

  branch(1, 1, limit);

  /** @link https://stackoverflow.com/a/41647548 */
  function branch(seed: number, level: number, limit: number) {
    const levelSum = Math.pow(2, level) + 1;

    if (limit === level + 1) {
      result.push(seed);
      result.push(levelSum - seed);
      return;
    } else if (seed % 2 === 1) {
      branch(seed, level + 1, limit);
      branch(levelSum - seed, level + 1, limit);
    } else {
      branch(levelSum - seed, level + 1, limit);
      branch(seed, level + 1, limit);
    }
  }

  return result;
}

function getBaseLog(x: number, y: number) {
  return Math.log(y) / Math.log(x);
}

function createMatch(args: Omit<Match, "id">): Match {
  return {
    // TODO: crypto.uuid
    id: Math.random().toString(),
    ...args,
  };
}

export type TeamIdentifier = number | "BYE";

export interface Match {
  id: string;
  upperTeam?: TeamIdentifier;
  lowerTeam?: TeamIdentifier;
  winner?: TeamIdentifier;
  /** Match that leads to this match */
  match1?: Match;
  /** Match that leads to this match */
  match2?: Match;
}

export interface Bracket {
  winners: Match[];
  losers: Match[];
  participantCount: number;
  participantsWithByesCount: number;
}
