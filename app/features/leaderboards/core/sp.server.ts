import { freshUserSkills } from "~/features/mmr/tiered";
import type { UserSPLeaderboardItem } from "../queries/userSPLeaderboard.server";
import type { SeasonPopularUsersWeapon } from "../queries/seasonPopularUsersWeapon.server";
import type { MainWeaponId } from "~/modules/in-game-lists";

export function addTiers(entries: UserSPLeaderboardItem[]) {
  const tiers = freshUserSkills();

  const encounteredTiers = new Set<string>();
  return entries.map((entry) => {
    const tier = tiers.userSkills[entry.id].tier;
    const tierKey = `${tier.name}${tier.isPlus ? "+" : ""}`;
    const tierAlreadyEncountered = encounteredTiers.has(tierKey);
    if (!tierAlreadyEncountered) {
      encounteredTiers.add(tierKey);
    }

    return {
      ...entry,
      tier: !tierAlreadyEncountered ? tier : undefined,
    };
  });
}

export function addWeapons(
  entries: ReturnType<typeof addTiers>,
  weapons: SeasonPopularUsersWeapon
) {
  return entries.map((entry) => {
    const weaponSplId = weapons[entry.id] as MainWeaponId | undefined;
    return {
      ...entry,
      weaponSplId,
    };
  });
}
