import { db } from "~/utils/db.server";

export function create({
  content,
  roomId,
  userId,
}: {
  content: string;
  roomId: string;
  userId: string;
}) {
  return db.chatMessage.create({
    data: {
      content,
      roomId,
      senderId: userId,
    },
  });
}

export function findByRoomIds(roomIds: string[]) {
  return db.chatMessage.findMany({
    where: { roomId: { in: roomIds } },
    orderBy: { createdAt: "asc" },
    include: {
      sender: true,
    },
  });
}
