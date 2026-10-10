import { db } from "~/db/sql";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import {
	commonUserObjectFields,
	isLiveStreamOf,
	jsonBuildObject,
} from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

export type ActiveMatchPlayersItem = Unwrapped<
	typeof findAllActiveMatchPlayers
>;
export function findAllActiveMatchPlayers() {
	const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);

	return db
		.selectFrom("Group")
		.innerJoin("GroupMatch", (join) =>
			join.on((eb) =>
				eb.or([
					eb("GroupMatch.alphaGroupId", "=", eb.ref("Group.id")),
					eb("GroupMatch.bravoGroupId", "=", eb.ref("Group.id")),
				]),
			),
		)
		.innerJoin("GroupMember", "GroupMember.groupId", "Group.id")
		.innerJoin("User", "User.id", "GroupMember.userId")
		.innerJoin("LiveStream", (join) => join.on(isLiveStreamOf()))
		.select((eb) => [
			"GroupMatch.id as groupMatchId",
			"GroupMatch.createdAt as groupMatchCreatedAt",
			"LiveStream.platform as streamPlatform",
			"LiveStream.account as streamAccount",
			"LiveStream.videoId as streamVideoId",
			"LiveStream.viewerCount as streamViewerCount",
			"LiveStream.thumbnailUrl as streamThumbnailUrl",
			jsonBuildObject(commonUserObjectFields(eb)).as("user"),
		])
		.where("Group.status", "=", "ACTIVE")
		.where("GroupMatch.createdAt", ">", dateToDatabaseTimestamp(oneHourAgo))
		.execute();
}
