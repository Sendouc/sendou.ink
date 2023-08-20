import { rating } from "openskill";
import { findCurrentSkillByUserId } from "./queries/findCurrentSkillByUserId.server";
import { findCurrentTeamSkillByIdentifier } from "./queries/findCurrentTeamSkillByIdentifier.server";
import { identifierToUserIds } from "./mmr-utils";

export function queryCurrentUserRating({
  userId,
  season,
}: {
  userId: number;
  season: number;
}) {
  const skill = findCurrentSkillByUserId({ userId, season: season ?? null });

  if (!skill) {
    return rating();
  }

  return rating(skill);
}

export function queryCurrentTeamRating({
  identifier,
  season,
}: {
  identifier: string;
  season: number;
}) {
  const skill = findCurrentTeamSkillByIdentifier({
    identifier,
    season,
  });

  if (!skill) return rating();

  return rating(skill);
}

export function queryTeamPlayerRatingAverage({
  identifier,
  season,
}: {
  identifier: string;
  season: number;
}) {
  const playerRatings = identifierToUserIds(identifier).map((userId) =>
    queryCurrentUserRating({ userId, season })
  );

  if (playerRatings.length === 0) return rating();

  return {
    mu:
      playerRatings.reduce((acc, cur) => acc + cur.mu, 0) /
      playerRatings.length,
    sigma:
      playerRatings.reduce((acc, cur) => acc + cur.sigma, 0) /
      playerRatings.length,
  };
}
