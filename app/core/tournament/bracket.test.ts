import { Stage } from ".prisma/client";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { eliminationBracket } from "./algorithms";
import {
  countRounds,
  getRoundNames,
  getRoundsDefaultBestOf,
  tournamentRoundsForDB,
} from "./bracket";
import { generateMapListForRounds } from "./mapList";

const CountBracketRounds = suite("countRounds()");
const RoundNames = suite("getRoundNames()");
const TournamentRoundsForDB = suite("tournamentRoundsForDB()");

CountBracketRounds("Counts bracket (DE - 38)", () => {
  const bracket = eliminationBracket(38, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 8, losers: 9 });
});

CountBracketRounds("Counts bracket (DE - 10)", () => {
  const bracket = eliminationBracket(10, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 6, losers: 5 });
});

CountBracketRounds("Counts bracket (DE - 16)", () => {
  const bracket = eliminationBracket(16, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 6, losers: 6 });
});

CountBracketRounds("Counts bracket (SE - 16)", () => {
  const bracket = eliminationBracket(16, "SE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 5, losers: 0 });
});

RoundNames("No bracket reset round for SE", () => {
  const bracketSE = getRoundNames(eliminationBracket(16, "SE"));
  const bracketDE = getRoundNames(eliminationBracket(16, "DE"));

  let hasBR = false;
  for (const round of bracketDE.winners) {
    if (round === "Bracket Reset") hasBR = true;
  }
  assert.ok(hasBR);

  hasBR = false;
  for (const round of bracketSE.winners) {
    if (round === "Bracket Reset") hasBR = true;
  }
  assert.not.ok(hasBR);
});

const mapPool: Stage[] = JSON.parse(
  `[{"id":923,"mode":"TC","name":"The Reef"},{"id":925,"mode":"CB","name":"The Reef"},{"id":927,"mode":"SZ","name":"Musselforge Fitness"},{"id":929,"mode":"RM","name":"Musselforge Fitness"},{"id":934,"mode":"RM","name":"Starfish Mainstage"},{"id":942,"mode":"SZ","name":"Inkblot Art Academy"},{"id":943,"mode":"TC","name":"Inkblot Art Academy"},{"id":947,"mode":"SZ","name":"Sturgeon Shipyard"},{"id":948,"mode":"TC","name":"Sturgeon Shipyard"},{"id":953,"mode":"TC","name":"Moray Towers"},{"id":959,"mode":"RM","name":"Port Mackerel"},{"id":960,"mode":"CB","name":"Port Mackerel"},{"id":972,"mode":"SZ","name":"Snapper Canal"},{"id":978,"mode":"TC","name":"Blackbelly Skatepark"},{"id":980,"mode":"CB","name":"Blackbelly Skatepark"},{"id":985,"mode":"CB","name":"MakoMart"},{"id":987,"mode":"SZ","name":"Walleye Warehouse"},{"id":988,"mode":"TC","name":"Walleye Warehouse"},{"id":994,"mode":"RM","name":"Shellendorf Institute"},{"id":995,"mode":"CB","name":"Shellendorf Institute"},{"id":1007,"mode":"SZ","name":"Piranha Pit"},{"id":1012,"mode":"SZ","name":"Camp Triggerfish"},{"id":1019,"mode":"RM","name":"Wahoo World"},{"id":1020,"mode":"CB","name":"Wahoo World"},{"id":1027,"mode":"SZ","name":"Ancho-V Games"},{"id":1034,"mode":"RM","name":"Skipper Pavilion"}]`
);
const bracket = eliminationBracket(24, "DE");
const rounds = getRoundsDefaultBestOf(bracket);
const mapList = generateMapListForRounds({ mapPool, rounds });

TournamentRoundsForDB("Generates rounds correctly", () => {
  const TEAM_COUNT = 24;
  const bracketForDb = tournamentRoundsForDB({
    mapList,
    bracketType: "DE",
    participantsSeeded: new Array(TEAM_COUNT)
      .fill(null)
      .map((_, i) => i + 1)
      .map(String)
      .map((id) => ({ id })),
  });
  const roundsCounted = countRounds(bracket);
  let max = -Infinity;
  let min = Infinity;
  let uniqueParticipants = new Set<string>();

  for (const round of bracketForDb) {
    max = Math.max(max, round.position);
    min = Math.min(min, round.position);

    for (const match of round.matches) {
      for (const participant of match.participants) {
        if (round.position !== 1) {
          throw new Error("Participant found not first round");
        }
        if (typeof participant.team === "string") {
          uniqueParticipants.add(participant.team);
          continue;
        }
        assert.not.ok(uniqueParticipants.has(participant.team.id));
        uniqueParticipants.add(participant.team.id);
      }
    }
  }

  assert.equal(max, roundsCounted.winners);
  assert.equal(min, -roundsCounted.losers);
  assert.equal(uniqueParticipants.size, TEAM_COUNT + 1); // + BYE
});

CountBracketRounds.run();
RoundNames.run();
TournamentRoundsForDB.run();
