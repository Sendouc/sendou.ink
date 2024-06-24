import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { db } from "~/db/sql";
import type {
	Tables,
	TablesInsertable,
	UserMapModePreferences,
} from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { userIsBanned } from "../ban/core/banned.server";
import type { LookingGroupWithInviteCode } from "./q-types";

export function mapModePreferencesByGroupId(groupId: number) {
	return db
		.selectFrom("GroupMember")
		.innerJoin("User", "User.id", "GroupMember.userId")
		.select(["User.id as userId", "User.mapModePreferences as preferences"])
		.where("GroupMember.groupId", "=", groupId)
		.where("User.mapModePreferences", "is not", null)
		.execute() as Promise<
		{ userId: number; preferences: UserMapModePreferences }[]
	>;
}

// groups visible for longer to make development easier
const SECONDS_TILL_STALE =
	process.env.NODE_ENV === "development" ? 1_000_000 : 1_800;

export async function findLookingGroups({
	minGroupSize,
	maxGroupSize,
	ownGroupId,
	includeChatCode = false,
	includeMapModePreferences = false,
	loggedInUserId,
}: {
	minGroupSize?: number;
	maxGroupSize?: number;
	ownGroupId?: number;
	includeChatCode?: boolean;
	includeMapModePreferences?: boolean;
	loggedInUserId?: number;
}): Promise<LookingGroupWithInviteCode[]> {
	const rows = await db
		.selectFrom("Group")
		.leftJoin("GroupMatch", (join) =>
			join.on((eb) =>
				eb.or([
					eb("GroupMatch.alphaGroupId", "=", eb.ref("Group.id")),
					eb("GroupMatch.bravoGroupId", "=", eb.ref("Group.id")),
				]),
			),
		)
		.select((eb) => [
			"Group.id",
			"Group.createdAt",
			"Group.chatCode",
			"Group.inviteCode",
			jsonArrayFrom(
				eb
					.selectFrom("GroupMember")
					.innerJoin("User", "User.id", "GroupMember.userId")
					.leftJoin("PlusTier", "PlusTier.userId", "GroupMember.userId")
					.select((arrayEb) => [
						...COMMON_USER_FIELDS,
						"User.qWeaponPool as weapons",
						"PlusTier.tier as plusTier",
						"GroupMember.note",
						"GroupMember.role",
						"User.languages",
						"User.vc",
						"User.noScreen",
						jsonObjectFrom(
							eb
								.selectFrom("PrivateUserNote")
								.select([
									"PrivateUserNote.sentiment",
									"PrivateUserNote.text",
									"PrivateUserNote.updatedAt",
								])
								.where("authorId", "=", loggedInUserId ?? -1)
								.where("targetId", "=", arrayEb.ref("User.id")),
						).as("privateNote"),
						sql<
							string | null
						>`IIF(COALESCE("User"."patronTier", 0) >= 2, "User"."css" ->> 'chat', null)`.as(
							"chatNameColor",
						),
					])
					.where("GroupMember.groupId", "=", eb.ref("Group.id"))
					.groupBy("GroupMember.userId"),
			).as("members"),
		])
		.$if(includeMapModePreferences, (qb) =>
			qb.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom("GroupMember")
						.innerJoin("User", "User.id", "GroupMember.userId")
						.select("User.mapModePreferences")
						.where("GroupMember.groupId", "=", eb.ref("Group.id"))
						.where("User.mapModePreferences", "is not", null),
				).as("mapModePreferences"),
			),
		)
		.where("Group.status", "=", "ACTIVE")
		.where("GroupMatch.id", "is", null)
		.where((eb) =>
			eb.or([
				eb(
					"Group.latestActionAt",
					">",
					sql<number>`(unixepoch() - ${SECONDS_TILL_STALE})`,
				),
				eb("Group.id", "=", ownGroupId ?? -1),
			]),
		)
		.execute();

	// TODO: a bit weird we filter chatCode here but not inviteCode and do some logic about filtering
	return rows
		.map((row) => {
			return {
				...row,
				chatCode: includeChatCode ? row.chatCode : undefined,
				mapModePreferences: row.mapModePreferences?.map(
					(c) => c.mapModePreferences,
				) as NonNullable<Tables["User"]["mapModePreferences"]>[],
				members: row.members.map((member) => {
					return {
						...member,
						languages: member.languages ? member.languages.split(",") : [],
					} as LookingGroupWithInviteCode["members"][number];
				}),
			};
		})
		.filter((group) => {
			if (group.id === ownGroupId) return true;
			if (maxGroupSize && group.members.length > maxGroupSize) return false;
			if (minGroupSize && group.members.length < minGroupSize) return false;

			return true;
		});
}

export async function findActiveGroupMembers() {
	return db
		.selectFrom("GroupMember")
		.innerJoin("Group", "Group.id", "GroupMember.groupId")
		.select("GroupMember.userId")
		.where("Group.status", "!=", "INACTIVE")
		.execute();
}

type CreateGroupArgs = {
	status: Exclude<Tables["Group"]["status"], "INACTIVE">;
	userId: number;
};
export function createGroup(args: CreateGroupArgs) {
	return db.transaction().execute(async (trx) => {
		const createdGroup = await trx
			.insertInto("Group")
			.values({
				inviteCode: nanoid(INVITE_CODE_LENGTH),
				chatCode: nanoid(INVITE_CODE_LENGTH),
				status: args.status,
			})
			.returning("id")
			.executeTakeFirstOrThrow();

		await trx
			.insertInto("GroupMember")
			.values({
				groupId: createdGroup.id,
				userId: args.userId,
				role: "OWNER",
			})
			.execute();

		return createdGroup;
	});
}

type CreateGroupFromPreviousGroupArgs = {
	previousGroupId: number;
	members: {
		id: number;
		role: Tables["GroupMember"]["role"];
	}[];
};
export async function createGroupFromPrevious(
	args: CreateGroupFromPreviousGroupArgs,
) {
	return db.transaction().execute(async (trx) => {
		const createdGroup = await trx
			.insertInto("Group")
			.columns(["teamId", "chatCode", "inviteCode", "status"])
			.expression((eb) =>
				eb
					.selectFrom("Group")
					.select((eb) => [
						"Group.teamId",
						"Group.chatCode",
						eb.val(nanoid(INVITE_CODE_LENGTH)).as("inviteCode"),
						eb.val("PREPARING").as("status"),
					])
					.where("Group.id", "=", args.previousGroupId),
			)
			.returning("id")
			.executeTakeFirstOrThrow();

		await trx
			.insertInto("GroupMember")
			.values(
				args.members.map((member) => ({
					groupId: createdGroup.id,
					userId: member.id,
					role: member.role,
				})),
			)
			.execute();

		return createdGroup;
	});
}

export function rechallenge({
	likerGroupId,
	targetGroupId,
}: {
	likerGroupId: number;
	targetGroupId: number;
}) {
	return db
		.updateTable("GroupLike")
		.set({ isRechallenge: 1 })
		.where("likerGroupId", "=", likerGroupId)
		.where("targetGroupId", "=", targetGroupId)
		.execute();
}

export function upsertPrivateUserNote(
	args: TablesInsertable["PrivateUserNote"],
) {
	return db
		.insertInto("PrivateUserNote")
		.values({
			authorId: args.authorId,
			targetId: args.targetId,
			sentiment: args.sentiment,
			text: args.text,
		})
		.onConflict((oc) =>
			oc.columns(["authorId", "targetId"]).doUpdateSet({
				sentiment: args.sentiment,
				text: args.text,
				updatedAt: dateToDatabaseTimestamp(new Date()),
			}),
		)
		.execute();
}

export function deletePrivateUserNote({
	authorId,
	targetId,
}: {
	authorId: number;
	targetId: number;
}) {
	return db
		.deleteFrom("PrivateUserNote")
		.where("authorId", "=", authorId)
		.where("targetId", "=", targetId)
		.execute();
}

export async function usersThatTrusted(userId: number) {
	const rows = await db
		.selectFrom("TeamMember")
		.innerJoin("User", "User.id", "TeamMember.userId")
		.innerJoin("UserFriendCode", "UserFriendCode.userId", "User.id")
		.select([...COMMON_USER_FIELDS, "User.inGameName"])
		.where((eb) =>
			eb(
				"TeamMember.teamId",
				"=",
				eb
					.selectFrom("TeamMember")
					.select("TeamMember.teamId")
					.where("TeamMember.userId", "=", userId),
			),
		)
		.union((eb) =>
			eb
				.selectFrom("TrustRelationship")
				.innerJoin("User", "User.id", "TrustRelationship.trustGiverUserId")
				.innerJoin("UserFriendCode", "UserFriendCode.userId", "User.id")
				.select([...COMMON_USER_FIELDS, "User.inGameName"])
				.where("TrustRelationship.trustReceiverUserId", "=", userId),
		)
		.orderBy("User.username asc")
		.execute();

	const rowsWithoutBanned = rows.filter((row) => !userIsBanned(row.id));

	return rowsWithoutBanned;
}
