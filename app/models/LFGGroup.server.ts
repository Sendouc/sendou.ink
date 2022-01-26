import type { LFGGroupType } from "@prisma/client";
import { db } from "~/utils/db.server";

export function create({
  type,
  ranked,
  user,
}: {
  type: LFGGroupType;
  ranked?: boolean;
  user: { id: string };
}) {
  return db.lFGGroup.create({
    data: {
      type,
      // TWIN becomes active immediately because it makes no sense
      // to pre-add players to the group
      active: type === "TWIN",
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
