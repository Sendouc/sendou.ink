import { freshUserSkills } from "~/features/mmr/tiered.server";
import type { UserSPLeaderboardItem } from "../queries/userSPLeaderboard.server";
import type { SeasonPopularUsersWeapon } from "../queries/seasonPopularUsersWeapon.server";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { weaponCategories } from "~/modules/in-game-lists";
import type { TeamSPLeaderboardItem } from "../queries/teamSPLeaderboard.server";
import { seasonHasTopTen } from "../leaderboards-utils";

export function addTiers(entries: UserSPLeaderboardItem[], season: number) {
  const tiers = freshUserSkills(season);

  const encounteredTiers = new Set<string>();
  return entries.map((entry, i) => {
    if (i < 10 && seasonHasTopTen(season)) {
      return { ...entry, tier: undefined };
    }

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

const PLUS_TIER_QUOTA = {
  "+1": 10,
  "+2": 20,
  "+3": 30,
} as const;
export function addPendingPlusTiers<T extends UserSPLeaderboardItem>(
  entries: T[],
) {
  const quota: { "+1": number; "+2": number; "+3": number } = {
    ...PLUS_TIER_QUOTA,
  };

  const resolveHighestPlusTierWithSpace = () => {
    if (quota["+1"] > 0) return 1;
    if (quota["+2"] > 0) return 2;
    if (quota["+3"] > 0) return 3;

    return null;
  };

  for (const entry of entries) {
    const highestPlusTierWithSpace = resolveHighestPlusTierWithSpace();
    if (!highestPlusTierWithSpace) break;

    if (entry.plusTier && entry.plusTier <= highestPlusTierWithSpace) continue;

    entry.pendingPlusTier = highestPlusTierWithSpace;
    const key = `+${highestPlusTierWithSpace}` as const;
    quota[key] -= 1;
  }

  return entries;
}

export function addWeapons<T extends { id: number }>(
  entries: T[],
  weapons: SeasonPopularUsersWeapon,
) {
  return entries.map((entry) => {
    const weaponSplId = weapons[entry.id] as MainWeaponId | undefined;
    return {
      ...entry,
      weaponSplId,
    };
  });
}

export function filterByWeaponCategory<
  T extends { weaponSplId?: MainWeaponId },
>(entries: Array<T>, category: (typeof weaponCategories)[number]["name"]) {
  const weaponIdsOfCategory = new Set(
    weaponCategories.find((c) => c.name === category)!.weaponIds,
  );

  return entries.filter(
    (entry) => entry.weaponSplId && weaponIdsOfCategory.has(entry.weaponSplId),
  );
}

export function oneEntryPerUser(entries: TeamSPLeaderboardItem[]) {
  const encounteredUserIds = new Set<number>();
  return entries.filter((entry) => {
    if (entry.members.some((m) => encounteredUserIds.has(m.id))) {
      return false;
    }

    for (const member of entry.members) {
      encounteredUserIds.add(member.id);
    }

    return true;
  });
}

export function addPlacementRank<T>(entries: T[]) {
  return entries.map((entry, index) => ({
    ...entry,
    placementRank: index + 1,
  }));
}
