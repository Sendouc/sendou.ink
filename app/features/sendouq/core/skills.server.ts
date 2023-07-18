import type { GroupMatch, Skill, Team, User } from "~/db/types";
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
  winner: {
    userIds: User["id"][];
    teamId?: Team["id"];
  };
  loser: {
    userIds: User["id"][];
    teamId?: Team["id"];
  };
}) {
  const result: Array<
    Pick<
      Skill,
      "groupMatchId" | "identifier" | "mu" | "season" | "sigma" | "userId"
    >
  > = [];

  // if no ranked season is active, match only affects all-time rankings
  const seasonOption =
    typeof currentSeason() === "number" ? [null, currentSeason()] : [null];

  // individual skills
  for (const season of seasonOption) {
    const [winnerTeamNew, loserTeamNew] = rate([
      winner.userIds.map((userId) =>
        queryCurrentUserRating({ userId, season })
      ),
      loser.userIds.map((userId) => queryCurrentUserRating({ userId, season })),
    ]);

    for (const [index, userId] of winner.userIds.entries()) {
      result.push({
        groupMatchId: groupMatchId,
        identifier: null,
        mu: winnerTeamNew[index].mu,
        season,
        sigma: winnerTeamNew[index].sigma,
        userId,
      });
    }

    for (const [index, userId] of loser.userIds.entries()) {
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
  const winnerTeamIdentifier = winner.teamId
    ? String(winner.teamId)
    : userIdsToIdentifier(winner.userIds);
  const loserTeamIdentifier = loser.teamId
    ? String(loser.teamId)
    : userIdsToIdentifier(loser.userIds);

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
