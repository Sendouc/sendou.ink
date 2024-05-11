import { currentOrPreviousSeason } from "~/features/mmr/season";
import type { TieredSkill } from "~/features/mmr/tiered.server";
import { userSkills } from "~/features/mmr/tiered.server";
import type { Unpacked } from "~/utils/types";
import * as LFGRepository from "../LFGRepository.server";

// xxx: skills
export const loader = async (/*{}: LoaderFunctionArgs*/) => {
  const posts = await LFGRepository.posts();

  return {
    posts,
    tiersMap: postsUsersTiersMap(posts),
  };
};

function postsUsersTiersMap(
  posts: Unpacked<ReturnType<typeof LFGRepository.posts>>,
) {
  const latestSeason = currentOrPreviousSeason(new Date())!.nth;
  const previousSeason = latestSeason - 1;

  const latestSeasonSkills = userSkills(latestSeason).userSkills;
  const previousSeasonSkills = userSkills(previousSeason).userSkills;

  const uniqueUsers = new Set<number>();
  for (const post of posts) {
    uniqueUsers.add(post.author.id);

    for (const user of post.team?.members ?? []) {
      uniqueUsers.add(user.id);
    }
  }

  const userSkillsMap = new Map<
    number,
    { latest?: TieredSkill["tier"]; previous?: TieredSkill["tier"] }
  >();

  for (const userId of uniqueUsers) {
    const tiers = {
      latest: latestSeasonSkills[userId]?.tier,
      previous: previousSeasonSkills[userId]?.tier,
    };

    if (tiers.latest || tiers.previous) {
      userSkillsMap.set(userId, tiers);
    }
  }

  return Array.from(userSkillsMap.entries());
}