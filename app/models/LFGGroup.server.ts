import type { LfgGroupType } from "@prisma/client";
import { generateMapListForLfgMatch } from "~/core/play/mapList";
import { db } from "~/utils/db.server";

export function create({
  type,
  ranked,
  user,
}: {
  type: LfgGroupType;
  ranked?: boolean;
  user: { id: string };
}) {
  return db.lfgGroup.create({
    data: {
      type,
      // TWIN starts looking immediately because it makes no sense
      // to pre-add players to the group
      looking: type === "TWIN",
      ranked,
      members: {
        create: {
          memberId: user.id,
          captain: true,
        },
      },
    },
  });
}

export function like({
  likerId,
  targetId,
}: {
  likerId: string;
  targetId: string;
}) {
  return db.lfgGroupLike.create({
    data: {
      likerId,
      targetId,
    },
  });
}

export function unlike({
  likerId,
  targetId,
}: {
  likerId: string;
  targetId: string;
}) {
  return db.lfgGroupLike.delete({
    where: {
      likerId_targetId: {
        likerId,
        targetId,
      },
    },
  });
}

export interface UniteGroupsArgs {
  survivingGroupId: string;
  otherGroupId: string;
  removeCaptainsFromOther: boolean;
  unitedGroupIsRanked?: boolean;
}
export function uniteGroups({
  survivingGroupId,
  otherGroupId,
  removeCaptainsFromOther,
  unitedGroupIsRanked,
}: UniteGroupsArgs) {
  const queries = [
    db.lfgGroupMember.updateMany({
      where: { groupId: otherGroupId },
      data: {
        groupId: survivingGroupId,
        captain: removeCaptainsFromOther ? false : undefined,
        // TODO: also reset message
      },
    }),
    db.lfgGroup.delete({ where: { id: otherGroupId } }),
    db.lfgGroupLike.deleteMany({
      where: {
        OR: [{ likerId: survivingGroupId }, { targetId: survivingGroupId }],
      },
    }),
  ];

  if (typeof unitedGroupIsRanked === "boolean") {
    queries.push(
      db.lfgGroup.update({
        where: { id: survivingGroupId },
        data: { ranked: unitedGroupIsRanked },
      })
    );
  }

  return db.$transaction(queries);
}

export async function matchUp(groupIds: [string, string]) {
  const match = await db.lfgGroupMatch.create({
    data: {
      stages: {
        createMany: {
          data: generateMapListForLfgMatch(),
        },
      },
    },
  });

  return db.lfgGroup.updateMany({
    where: {
      id: {
        in: groupIds,
      },
    },
    data: {
      matchId: match.id,
      looking: false,
    },
  });
}

export function findById(id: string) {
  return db.lfgGroup.findUnique({ where: { id }, include: { members: true } });
}

export function findActiveByMember(user: { id: string }) {
  return db.lfgGroup.findFirst({
    where: {
      active: true,
      members: {
        some: {
          memberId: user.id,
        },
      },
    },
    include: {
      members: true,
      likedGroups: {
        select: {
          targetId: true,
        },
      },
      likesReceived: {
        select: {
          likerId: true,
        },
      },
    },
  });
}

export function findLookingByType(type: LfgGroupType, ranked?: boolean) {
  return db.lfgGroup.findMany({
    where: {
      type,
      looking: true,
      ranked,
    },
    select: {
      id: true,
      ranked: true,
      members: {
        select: {
          user: {
            select: {
              id: true,
              discordAvatar: true,
              discordDiscriminator: true,
              discordName: true,
              discordId: true,
              skill: {
                select: {
                  mu: true,
                  sigma: true,
                },
                orderBy: {
                  createdAt: "desc",
                },
                distinct: "userId",
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function startLooking(id: string) {
  return db.lfgGroup.update({
    where: {
      id,
    },
    data: {
      looking: true,
    },
  });
}

export function setInactive(id: string) {
  return db.lfgGroup.update({
    where: {
      id,
    },
    data: {
      looking: false,
      active: false,
    },
  });
}
