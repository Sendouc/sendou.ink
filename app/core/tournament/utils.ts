import { ROOM_PASS_LENGTH } from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";

export function checkInHasStarted(checkInStartTime: string) {
  return new Date(checkInStartTime) < new Date();
}

export function sortTeamsBySeed(seeds: string[]) {
  return function (
    a: { id: string; createdAt: string | Date },
    b: { id: string; createdAt: string | Date }
  ) {
    const aSeed = seeds.indexOf(a.id);
    const bSeed = seeds.indexOf(b.id);

    // if one team doesn't have seed and the other does
    // the one with the seed takes priority
    if (aSeed === -1 && bSeed !== -1) return 1;
    if (aSeed !== -1 && bSeed === -1) return -1;

    // if both teams are unseeded the one who registered
    // first gets to be seeded first as well
    if (aSeed === -1 && bSeed === -1) {
      return Number(a.createdAt) - Number(b.createdAt);
    }

    // finally, consider the seeds
    return aSeed - bSeed;
  };
}

export function tournamentHasStarted(
  brackets: {
    rounds: {
      position: number;
    }[];
  }[]
) {
  return brackets[0].rounds.length > 0;
}

export function matchIsOver(
  bestOf: number,
  score?: [upperTeamScore: number, lowerTeamScore: number]
) {
  if (!score) return false;

  const [upperTeamScore, lowerTeamScore] = score;
  const half = bestOf / 2;
  return upperTeamScore > half || lowerTeamScore > half;
}

export function resolveHostInfo({
  ourTeam,
  theirTeam,
  seeds,
}: {
  ourTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  theirTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  seeds: string[];
}): { friendCodeToAdd: string; roomPass: string; weHost: boolean } {
  const seededOrder = [ourTeam, theirTeam].sort(sortTeamsBySeed(seeds));
  const weAreHigherSeed = seededOrder[0].id === ourTeam.id;

  let weHost = false;
  if (ourTeam.canHost && !theirTeam.canHost) weHost = true;
  if (!ourTeam.canHost && !theirTeam.canHost && weAreHigherSeed) weHost = true;
  const teamToHost = weHost ? ourTeam : theirTeam;

  return {
    weHost,
    roomPass: teamToHost.roomPass ?? idToRoomPass(teamToHost.id),
    friendCodeToAdd: teamToHost.friendCode,
  };
}

function idToRoomPass(id: string) {
  let pass = "";
  for (const letter of id) {
    if (pass.length === ROOM_PASS_LENGTH) break;
    const maybeNumber = Number(letter);
    if (Number.isNaN(maybeNumber)) continue;

    pass += letter;
  }

  return pass;
}

export const friendCodeRegExpString = "^(SW-)?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$";
export const friendCodeRegExp = new RegExp(friendCodeRegExpString, "i");

export const roompassRegExpString = `^[0-9]{${ROOM_PASS_LENGTH}}$`;
export const roompassRegExp = new RegExp(roompassRegExpString, "i");
