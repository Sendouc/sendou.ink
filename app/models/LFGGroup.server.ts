import type { LfgGroupStatus, LfgGroupType, Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
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
      status: type === "TWIN" ? "LOOKING" : "PRE_ADD",
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

export function createPrefilled({
  ranked,
  members,
}: {
  ranked: boolean | null;
  members: { memberId: string; captain: boolean }[];
}) {
  return db.lfgGroup.create({
    data: {
      type: "VERSUS",
      ranked,
      status: "PRE_ADD",
      members: {
        createMany: { data: members },
      },
    },
  });
}

export async function like({
  likerId,
  targetId,
}: {
  likerId: string;
  targetId: string;
}) {
  try {
    // not transaction because doesn't really matter
    // if only one goes through and other not
    await Promise.all([
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
  } catch (e) {
    // No need for any errors if e.g. duplicate entry was tried or
    // liked user stopped looking
    if (e instanceof PrismaClientKnownRequestError) return;
    throw e;
  }
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

export function addMember({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  return db.lfgGroup.update({
    where: { id: groupId },
    data: {
      members: {
        create: {
          memberId: userId,
        },
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
  const survivingGroupUpdatedTimestamps = {
    lastActionAt: new Date(),
    createdAt: new Date(),
  };

  return db.$transaction([
    db.lfgGroupMember.updateMany({
      where: { groupId: otherGroupId },
      data: {
        groupId: survivingGroupId,
        captain: removeCaptainsFromOther ? false : undefined,
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
          ? { ranked: unitedGroupIsRanked, ...survivingGroupUpdatedTimestamps }
          : survivingGroupUpdatedTimestamps,
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

  await db.lfgGroup.updateMany({
    where: {
      id: {
        in: groupIds,
      },
    },
    data: {
      matchId: match.id,
      status: "MATCH",
    },
  });

  return match;
}

export function findByInviteCode(inviteCode: string) {
  return db.lfgGroup.findFirst({
    where: {
      inviteCode,
      status: "PRE_ADD",
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

export function findById(id: string) {
  return db.lfgGroup.findUnique({ where: { id }, include: { members: true } });
}

export type FindActiveByMember = Prisma.PromiseReturnType<
  typeof findActiveByMember
>;
export function findActiveByMember(user: { id: string }) {
  return db.lfgGroup.findFirst({
    where: {
      status: {
        not: "INACTIVE",
      },
      members: {
        some: {
          memberId: user.id,
        },
      },
    },
    include: {
      members: { include: { user: true } },
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

export async function activeUserIds() {
  const rows = await db.$queryRaw<
    {
      memberId: string;
      status: LfgGroupStatus;
    }[]
  >`
  SELECT "LfgGroupMember"."memberId", "LfgGroup".status
  FROM "LfgGroupMember"
  JOIN "LfgGroup" ON ("LfgGroupMember"."groupId" = "LfgGroup".id)
  WHERE "LfgGroup".status != 'INACTIVE';`;

  return new Map<string, LfgGroupStatus>(
    rows.map((r) => [r.memberId, r.status])
  );
}

export type FindLookingAndOwnActive = Prisma.PromiseReturnType<
  typeof findLookingAndOwnActive
>["groups"];
// TODO: refactor -> true by default
export async function findLookingAndOwnActive(
  userId?: string,
  showPreAddMatch = false
) {
  const mainFilter = showPreAddMatch
    ? {
        NOT: {
          status: "INACTIVE" as const,
        },
      }
    : {
        status: "LOOKING" as const,
      };
  const where = userId
    ? {
        OR: [
          mainFilter,
          {
            members: {
              some: {
                memberId: userId,
              },
            },
            NOT: {
              status: "INACTIVE" as const,
            },
          },
        ],
      }
    : mainFilter;
  const groups = await db.lfgGroup.findMany({
    where,
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

  const ownGroup = groups.find((g) =>
    g.members.some((m) => m.user.id === userId)
  );

  return { groups, ownGroup };
}

export function startLooking(id: string) {
  return db.lfgGroup.update({
    where: {
      id,
    },
    data: {
      status: "LOOKING",
    },
  });
}

export function setInactive(id: string) {
  return db.lfgGroup.update({
    where: {
      id,
    },
    data: {
      status: "INACTIVE",
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
