import invariant from "tiny-invariant";
import type { GroupMatch, Skill, User } from "~/db/types";
import {
  queryCurrentTeamRating,
  queryCurrentUserRating,
  rate,
  userIdsToIdentifier,
} from "~/features/mmr";
import { previousOrCurrentSeason } from "~/features/mmr/season";

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

  const season = previousOrCurrentSeason(new Date())?.nth;
  invariant(typeof season === "number", "No ranked season for skills");

  {
    // individual skills
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

  {
    // team skills
    const winnerTeamIdentifier = userIdsToIdentifier(winner);
    const loserTeamIdentifier = userIdsToIdentifier(loser);
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
