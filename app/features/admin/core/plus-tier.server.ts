import invariant from "tiny-invariant";
import { addPendingPlusTiers } from "~/features/leaderboards/core/leaderboards.server";
import { userSPLeaderboard } from "~/features/leaderboards/queries/userSPLeaderboard.server";
import { previousSeason } from "~/features/mmr/season";
import * as AdminRepository from "~/features/admin/AdminRepository.server";

export async function plusTiersFromVotingAndLeaderboard() {
  return [
    ...fromLeaderboard(),
    ...(await AdminRepository.allPlusTiersFromLatestVoting()),
  ];
}

function fromLeaderboard() {
  const now = new Date();
  const lastCompletedSeason = previousSeason(now);
  invariant(lastCompletedSeason, "No previous season found");

  // there has been voting after this season ended, the results no longer apply
  if (now.getMonth() !== lastCompletedSeason.ends.getMonth()) return [];

  const leaderboard = addPendingPlusTiers(
    userSPLeaderboard(lastCompletedSeason.nth),
  );

  return leaderboard.flatMap((entry) => {
    if (!entry.pendingPlusTier) return [];

    return {
      userId: entry.id,
      tier: entry.pendingPlusTier,
    };
  });
}
