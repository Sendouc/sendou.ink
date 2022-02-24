import type { LfgGroupType, Prisma } from "@prisma/client";
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
      // looking: type === "TWIN",
      looking: true,
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
  // not transaction because doesn't really matter
  // if only one goes through and other not
  return Promise.all([
    db.lfgGroupLike.create({
      data: {
        likerId,
        targetId,
      },
    }),
    db.lfgGroup.update({
      where: { id: likerId },
      data: {
        lastActionAt: new Date(),
      },
    }),
  ]);
}

export function unlike({
  likerId,
  targetId,
}: {
  likerId: string;
  targetId: string;
}) {
  // not transaction because doesn't really matter
  // if only one goes through and other not
  return Promise.all([
    db.lfgGroupLike.delete({
      where: {
        likerId_targetId: {
          likerId,
          targetId,
        },
      },
    }),
    db.lfgGroup.update({
      where: { id: likerId },
      data: {
        lastActionAt: new Date(),
      },
    }),
  ]);
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
  return db.$transaction([
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
    db.lfgGroup.update({
      where: { id: survivingGroupId },
      data:
        typeof unitedGroupIsRanked === "boolean"
          ? { ranked: unitedGroupIsRanked, lastActionAt: new Date() }
          : { lastActionAt: new Date() },
    }),
  ]);
}

export async function matchUp({
  groupIds,
  ranked,
}: {
  groupIds: [string, string];
  ranked?: boolean;
}) {
  const match = await db.lfgGroupMatch.create({
    data: {
      stages: ranked
        ? {
            createMany: {
              data: generateMapListForLfgMatch(),
            },
          }
        : undefined,
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

export type FindLooking = Prisma.PromiseReturnType<typeof findLooking>;
export function findLooking() {
  return db.lfgGroup.findMany({
    where: {
      active: true,
      looking: true,
    },
    include: {
      members: {
        include: {
          user: {
            include: {
              skill: {
                orderBy: {
                  createdAt: "desc",
                },
                distinct: "userId",
              },
            },
          },
        },
      },
      likedGroups: true,
      likesReceived: true,
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

export function leaveGroup({
  groupId,
  memberId,
}: {
  groupId: string;
  memberId: string;
}) {
  // delete many so we don't throw in case
  // the group was just integrated into another
  // group
  return db.lfgGroupMember.deleteMany({
    where: {
      groupId,
      memberId,
      // no escaping group if match has been formed
      group: {
        matchId: null,
      },
    },
  });
}

export function unexpire(groupId: string) {
  return db.lfgGroup.update({
    where: {
      id: groupId,
    },
    data: {
      lastActionAt: new Date(),
    },
  });
}
