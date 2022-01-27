import type { LfgGroupType } from "@prisma/client";
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
      members: true
    }
  });
}

export function startLooking(id: string) {
  return db.lfgGroup.update({
    where: {
      id
    },
    data: {
      looking: true
    }
  })
}
