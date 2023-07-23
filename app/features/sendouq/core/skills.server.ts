import type { GroupMatch, Skill, User } from "~/db/types";
import {
  currentSeason,
  queryCurrentTeamRating,
  queryCurrentUserRating,
  rate,
  userIdsToIdentifier,
} from "~/features/mmr";

export function calculateMatchSkills({
  groupMatchId,
  winner,
  loser,
}: {
  groupMatchId: GroupMatch["id"];
  winner: User["id"][];
  loser: User["id"][];
}) {
  const result: Array<
    Pick<
      Skill,
      "groupMatchId" | "identifier" | "mu" | "season" | "sigma" | "userId"
    >
  > = [];

  // if no ranked season is active, match only affects all-time rankings
  const season = currentSeason(new Date())?.nth;
  const seasonOption = typeof season === "number" ? [null, season] : [null];

  // individual skills
  for (const season of seasonOption) {
    const [winnerTeamNew, loserTeamNew] = rate([
      winner.map((userId) => queryCurrentUserRating({ userId, season })),
      loser.map((userId) => queryCurrentUserRating({ userId, season })),
    ]);

    for (const [index, userId] of winner.entries()) {
      result.push({
        groupMatchId: groupMatchId,
        identifier: null,
        mu: winnerTeamNew[index].mu,
        season,
        sigma: winnerTeamNew[index].sigma,
        userId,
      });
    }

    for (const [index, userId] of loser.entries()) {
      result.push({
        groupMatchId: groupMatchId,
        identifier: null,
        mu: loserTeamNew[index].mu,
        season,
        sigma: loserTeamNew[index].sigma,
        userId,
      });
    }
  }

  // team skills
  const winnerTeamIdentifier = userIdsToIdentifier(winner);
  const loserTeamIdentifier = userIdsToIdentifier(loser);

  for (const season of seasonOption) {
    const [[winnerTeamNew], [loserTeamNew]] = rate([
      [queryCurrentTeamRating({ identifier: winnerTeamIdentifier, season })],
      [queryCurrentTeamRating({ identifier: loserTeamIdentifier, season })],
    ]);

    result.push({
      groupMatchId: groupMatchId,
      identifier: winnerTeamIdentifier,
      mu: winnerTeamNew.mu,
      season,
      sigma: winnerTeamNew.sigma,
      userId: null,
    });
    result.push({
      groupMatchId: groupMatchId,
      identifier: loserTeamIdentifier,
      mu: loserTeamNew.mu,
      season,
      sigma: loserTeamNew.sigma,
      userId: null,
    });
  }

  return result;
}
