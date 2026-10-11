import { logger } from "~/utils/logger";
import * as VoiceRepository from "../VoiceRepository.server";
import * as Daily from "./Daily.server";
import * as VoicePresence from "./VoicePresence.server";

export async function ejectUsers({
	room,
	userIds,
}: {
	room: { roomId: number; participantUserIds: number[] };
	userIds: number[];
}) {
	if (userIds.length === 0 || !Daily.isConfigured()) return;

	try {
		await VoiceRepository.markSessionsLeft({
			roomId: room.roomId,
			userIds,
			leaveReason: "EJECTED",
		});
		VoicePresence.remove(room, userIds);
		await Daily.ejectUsers({ chatRoomId: room.roomId, userIds, ban: false });
	} catch (error) {
		logger.error("Ejecting users from the voice call failed", error);
	}
}
