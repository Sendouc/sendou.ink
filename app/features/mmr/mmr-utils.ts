import { rate as openskillRate } from "openskill";
import type { Team } from "openskill/dist/types";
import invariant from "tiny-invariant";

const TAU = 0.3;

export function ordinalToSp(ordinal: number) {
  return toTwoDecimals(ordinal * 10 + 1000);
}

function toTwoDecimals(value: number) {
  return Number(value.toFixed(2));
}

export function rate(teams: Team[]) {
  return openskillRate(teams, { tau: TAU, preventSigmaIncrease: true });
}

export function userIdsToIdentifier(userIds: number[]) {
  invariant(userIds.length === 4, "userIds for identifier must be length 4");
  return [...userIds].sort((a, b) => a - b).join("-");
}
