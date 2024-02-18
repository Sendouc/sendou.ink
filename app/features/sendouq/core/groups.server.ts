import invariant from "tiny-invariant";
import type { Tables } from "~/db/tables";
import type { Group } from "~/db/types";
import { TIERS } from "~/features/mmr/mmr-constants";
import { defaultOrdinal } from "~/features/mmr/mmr-utils";
import type {
  SkillTierInterval,
  TieredSkill,
} from "~/features/mmr/tiered.server";
import { modesShort } from "~/modules/in-game-lists";
import { databaseTimestampToDate } from "~/utils/dates";
import { FULL_GROUP_SIZE } from "../q-constants";
import type {
  DividedGroups,
  DividedGroupsUncensored,
  LookingGroup,
  LookingGroupWithInviteCode,
} from "../q-types";
import type { RecentMatchPlayer } from "../queries/findRecentMatchPlayersByUserId.server";
import { mapModePreferencesToModeList } from "./match.server";

export function divideGroups({
  groups,
  ownGroupId,
  likes,
}: {
  groups: LookingGroupWithInviteCode[];
  ownGroupId: number;
  likes: Pick<
    Tables["GroupLike"],
    "likerGroupId" | "targetGroupId" | "isRechallenge"
  >[];
}): DividedGroupsUncensored {
  let own: LookingGroupWithInviteCode | null = null;
  const neutral: LookingGroupWithInviteCode[] = [];
  const likesReceived: LookingGroupWithInviteCode[] = [];

  const unneutralGroupIds = new Set<number>();
  for (const like of likes) {
    for (const group of groups) {
      if (group.id === ownGroupId) continue;

      // handles edge case where they liked each other
      // right after each other so the group didn't morph
      // so instead it will look so that the group liked us
      // and there is the option to morph
      if (unneutralGroupIds.has(group.id)) continue;

      if (like.likerGroupId === group.id) {
        likesReceived.push(group);
        if (like.isRechallenge) {
          group.isRechallenge = true;
        }

        unneutralGroupIds.add(group.id);
        break;
      }
      if (like.targetGroupId === group.id) {
        group.isLiked = true;
        if (like.isRechallenge) {
          group.isRechallenge = true;
        }
      }
    }
  }

  for (const group of groups) {
    if (group.id === ownGroupId) {
      own = group;
      continue;
    }

    if (unneutralGroupIds.has(group.id)) continue;

    neutral.push(group);
  }

  invariant(own && own.members, "own group not found");

  return {
    own,
    neutral,
    likesReceived,
  };
}

const MIN_PLAYERS_FOR_REPLAY = 3;
export function addReplayIndicator({
  groups,
  recentMatchPlayers,
  userId,
}: {
  groups: DividedGroupsUncensored;
  recentMatchPlayers: RecentMatchPlayer[];
  userId: number;
}): DividedGroupsUncensored {
  if (!recentMatchPlayers.length) return groups;

  const ownGroupId = recentMatchPlayers.find(
    (u) => u.userId === userId,
  )?.groupId;
  invariant(ownGroupId, "own group not found");
  const otherGroupId = recentMatchPlayers.find(
    (u) => u.groupId !== ownGroupId,
  )?.groupId;
  invariant(otherGroupId, "other group not found");

  const opponentPlayers = recentMatchPlayers
    .filter((u) => u.groupId === otherGroupId)
    .map((p) => p.userId);

  const addReplayIndicatorIfNeeded = (group: LookingGroupWithInviteCode) => {
    const samePlayersCount = group.members.reduce(
      (acc, cur) => (opponentPlayers.includes(cur.id) ? acc + 1 : acc),
      0,
    );

    return { ...group, isReplay: samePlayersCount >= MIN_PLAYERS_FOR_REPLAY };
  };

  return {
    own: groups.own,
    likesReceived: groups.likesReceived.map(addReplayIndicatorIfNeeded),
    neutral: groups.neutral.map(addReplayIndicatorIfNeeded),
  };
}

export function addFutureMatchModes(
  groups: DividedGroupsUncensored,
): DividedGroupsUncensored {
  const ownModePreferences = groups.own.mapModePreferences?.map((p) => p.modes);
  if (!ownModePreferences) return groups;

  const combinedMatchModes = (group: LookingGroupWithInviteCode) => {
    const theirModePreferences = group.mapModePreferences?.map((p) => p.modes);
    if (!theirModePreferences) return;

    return mapModePreferencesToModeList(
      ownModePreferences,
      theirModePreferences,
    ).sort((a, b) => modesShort.indexOf(a) - modesShort.indexOf(b));
  };

  const oneGroupMatchModes = (group: LookingGroupWithInviteCode) => {
    const modePreferences = group.mapModePreferences?.map((p) => p.modes);
    if (!modePreferences) return;

    return mapModePreferencesToModeList(modePreferences, []).sort(
      (a, b) => modesShort.indexOf(a) - modesShort.indexOf(b),
    );
  };

  const removeRechallengeIfIdentical = (group: LookingGroupWithInviteCode) => {
    if (!group.futureMatchModes || !group.rechallengeMatchModes) return group;

    return {
      ...group,
      rechallengeMatchModes:
        group.futureMatchModes.length === group.rechallengeMatchModes.length &&
        group.futureMatchModes.every(
          (m, i) => m === group.rechallengeMatchModes![i],
        )
          ? undefined
          : group.rechallengeMatchModes,
    };
  };

  return {
    own: groups.own,
    likesReceived: groups.likesReceived.map((g) => ({
      ...g,
      futureMatchModes: g.isRechallenge
        ? oneGroupMatchModes(groups.own)
        : combinedMatchModes(g),
    })),
    neutral: groups.neutral
      .map((g) => ({
        ...g,
        futureMatchModes: g.isRechallenge
          ? oneGroupMatchModes(g)
          : combinedMatchModes(g),
        rechallengeMatchModes: g.isLiked ? oneGroupMatchModes(g) : undefined,
      }))
      .map(removeRechallengeIfIdentical),
  };
}

const censorGroupFully = ({
  inviteCode: _inviteCode,
  mapModePreferences: _mapModePreferences,
  ...group
}: LookingGroupWithInviteCode): LookingGroup => ({
  ...group,
  members: undefined,
});
const censorGroupPartly = ({
  inviteCode: _inviteCode,
  mapModePreferences: _mapModePreferences,
  ...group
}: LookingGroupWithInviteCode): LookingGroup => group;
export function censorGroups({
  groups,
  showMembers,
  showInviteCode,
}: {
  groups: DividedGroupsUncensored;
  showMembers: boolean;
  showInviteCode: boolean;
}): DividedGroups {
  return {
    own: showInviteCode ? groups.own : censorGroupPartly(groups.own),
    neutral: groups.neutral.map(
      showMembers ? censorGroupPartly : censorGroupFully,
    ),
    likesReceived: groups.likesReceived.map(
      showMembers ? censorGroupPartly : censorGroupFully,
    ),
  };
}

export function sortGroupsBySkillAndSentiment({
  groups,
  userSkills,
  intervals,
}: {
  groups: DividedGroups;
  userSkills: Record<string, TieredSkill>;
  intervals: SkillTierInterval[];
}): DividedGroups {
  const ownGroupTier =
    groups.own.tier?.name ??
    resolveGroupSkill({
      group: groups.own as LookingGroupWithInviteCode,
      userSkills,
      intervals,
    })?.name;
  const ownGroupTierIndex = TIERS.findIndex((t) => t.name === ownGroupTier);

  const tierDiff = (otherGroupTierName?: string) => {
    if (!otherGroupTierName) return 10;

    const otherGroupTierIndex = TIERS.findIndex(
      (t) => t.name === otherGroupTierName,
    );

    return Math.abs(ownGroupTierIndex - otherGroupTierIndex);
  };

  const groupSentiment = (group: LookingGroup) => {
    if (group.members?.some((m) => m.privateNote?.sentiment === "NEGATIVE")) {
      return "NEGATIVE";
    }

    if (group.members?.some((m) => m.privateNote?.sentiment === "POSITIVE")) {
      return "POSITIVE";
    }

    return "NEUTRAL";
  };

  return {
    ...groups,
    neutral: groups.neutral.sort((a, b) => {
      const aTier =
        a.tier?.name ??
        resolveGroupSkill({
          group: a as LookingGroupWithInviteCode,
          userSkills,
          intervals,
        })?.name;
      const bTier =
        b.tier?.name ??
        resolveGroupSkill({
          group: b as LookingGroupWithInviteCode,
          userSkills,
          intervals,
        })?.name;

      const aSentiment = groupSentiment(a);
      const bSentiment = groupSentiment(b);

      if (aSentiment !== bSentiment) {
        if (aSentiment === "NEGATIVE") return 1;
        if (bSentiment === "NEGATIVE") return -1;
        if (aSentiment === "POSITIVE") return -1;
        if (bSentiment === "POSITIVE") return 1;
      }

      const aTierDiff = tierDiff(aTier);
      const bTierDiff = tierDiff(bTier);

      // if same tier difference, show newer groups first
      if (aTierDiff === bTierDiff) {
        return b.createdAt - a.createdAt;
      }

      // show groups with smaller tier difference first
      return aTierDiff - bTierDiff;
    }),
  };
}

export function addSkillsToGroups({
  groups,
  userSkills,
  intervals,
}: {
  groups: DividedGroupsUncensored;
  userSkills: Record<string, TieredSkill>;
  intervals: SkillTierInterval[];
}): DividedGroupsUncensored {
  const addSkill = (group: LookingGroupWithInviteCode) => ({
    ...group,
    members: group.members?.map((m) => {
      const skill = userSkills[String(m.id)];

      return {
        ...m,
        skill: !skill || skill.approximate ? ("CALCULATING" as const) : skill,
      };
    }),
    tier:
      group.members.length === FULL_GROUP_SIZE
        ? resolveGroupSkill({ group, userSkills, intervals })
        : undefined,
  });

  return {
    own: addSkill(groups.own),
    neutral: groups.neutral.map(addSkill),
    likesReceived: groups.likesReceived.map(addSkill),
  };
}

export function membersNeededForFull(currentSize: number) {
  return FULL_GROUP_SIZE - currentSize;
}

function resolveGroupSkill({
  group,
  userSkills,
  intervals,
}: {
  group: LookingGroupWithInviteCode;
  userSkills: Record<string, TieredSkill>;
  intervals: SkillTierInterval[];
}): TieredSkill["tier"] | undefined {
  const skills = group.members.map(
    (m) => userSkills[String(m.id)] ?? { ordinal: defaultOrdinal() },
  );

  const averageOrdinal =
    skills.reduce((acc, s) => acc + s.ordinal, 0) / skills.length;

  const tier = intervals.find(
    (i) => i.neededOrdinal && averageOrdinal > i.neededOrdinal,
  ) ?? { isPlus: false, name: "IRON" };

  // For Leviathan we don't specify if it's plus or not
  return tier.name === "LEVIATHAN"
    ? { name: "LEVIATHAN", isPlus: false }
    : { name: tier.name, isPlus: tier.isPlus };
}

export function groupExpiryStatus(
  group: Pick<Group, "latestActionAt">,
): null | "EXPIRING_SOON" | "EXPIRED" {
  // group expires in 30min without actions performed
  const groupExpiresAt =
    databaseTimestampToDate(group.latestActionAt).getTime() + 30 * 60 * 1000;

  const now = new Date().getTime();

  if (now > groupExpiresAt) {
    return "EXPIRED";
  }

  const tenMinutesFromNow = now + 10 * 60 * 1000;

  if (tenMinutesFromNow > groupExpiresAt) {
    return "EXPIRING_SOON";
  }

  return null;
}
