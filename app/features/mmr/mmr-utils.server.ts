import { rating } from "openskill";
import { findCurrentSkillByUserId } from "./queries/findCurrentSkillByUserId.server";
import { findCurrentTeamSkillByIdentifier } from "./queries/findCurrentTeamSkillByIdentifier.server";

export function queryCurrentUserRating({
  userId,
  season,
}: {
  userId: number;
  season?: number | null;
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
  season?: number | null;
}) {
  const skill = findCurrentTeamSkillByIdentifier({
    identifier,
    season: season ?? null,
  });

  if (!skill) {
    const userRatings = identifier
      .split("-")
      .map((userId) =>
        findCurrentSkillByUserId({
          userId: Number(userId),
          season: season ?? null,
        })
      )
      .filter(Boolean);

    if (userRatings.length === 0) return rating();

    let mu =
      userRatings.reduce((acc, cur) => acc + cur!.mu, 0) / userRatings.length;
    let sigma =
      userRatings.reduce((acc, cur) => acc + cur!.sigma, 0) /
      userRatings.length;

    // add a bit uncertainty if very low certainty
    if (sigma < 5) {
      mu--;
      sigma++;
    }

    return {
      mu,
      sigma,
    };
  }

  return rating(skill);
}
