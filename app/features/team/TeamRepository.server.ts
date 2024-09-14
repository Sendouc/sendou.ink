import type { Transaction } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { DB } from "~/db/tables";
import { databaseTimestampNow } from "~/utils/dates";
import invariant from "~/utils/invariant";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";

export function findMainByUserId(userId: number) {
	return db
		.selectFrom("TeamMember")
		.innerJoin("Team", "Team.id", "TeamMember.teamId")
		.leftJoin("UserSubmittedImage", "UserSubmittedImage.id", "Team.avatarImgId")
		.select([
			"Team.id",
			"Team.customUrl",
			"Team.name",
			"UserSubmittedImage.url as logoUrl",
		])
		.where("TeamMember.userId", "=", userId)
		.executeTakeFirst();
}

export function findAllMemberOfByUserId(userId: number) {
	return db
		.selectFrom("TeamMemberWithSecondary")
		.innerJoin("Team", "Team.id", "TeamMemberWithSecondary.teamId")
		.leftJoin("UserSubmittedImage", "UserSubmittedImage.id", "Team.avatarImgId")
		.select([
			"Team.id",
			"Team.customUrl",
			"Team.name",
			"UserSubmittedImage.url as logoUrl",
		])
		.where("TeamMemberWithSecondary.userId", "=", userId)
		.execute();
}

export type findByCustomUrl = NonNullable<
	Awaited<ReturnType<typeof findByCustomUrl>>
>;

export function findByCustomUrl(customUrl: string) {
	return db
		.selectFrom("Team")
		.leftJoin(
			"UserSubmittedImage as AvatarImage",
			"AvatarImage.id",
			"Team.avatarImgId",
		)
		.leftJoin(
			"UserSubmittedImage as BannerImage",
			"BannerImage.id",
			"Team.bannerImgId",
		)
		.select(({ eb }) => [
			"Team.id",
			"Team.name",
			"Team.twitter",
			"Team.bio",
			"Team.customUrl",
			"Team.css",
			"AvatarImage.url as avatarSrc",
			"BannerImage.url as bannerSrc",
			jsonArrayFrom(
				eb
					.selectFrom("TeamMemberWithSecondary")
					.innerJoin("User", "User.id", "TeamMemberWithSecondary.userId")
					.select(({ eb: innerEb }) => [
						...COMMON_USER_FIELDS,
						"TeamMemberWithSecondary.role",
						"TeamMemberWithSecondary.isOwner",
						"TeamMemberWithSecondary.isMainTeam",
						"User.country",
						"User.patronTier",
						jsonArrayFrom(
							innerEb
								.selectFrom("UserWeapon")
								.select(["UserWeapon.weaponSplId", "UserWeapon.isFavorite"])
								.whereRef("UserWeapon.userId", "=", "User.id"),
						).as("weapons"),
					])
					.whereRef("TeamMemberWithSecondary.teamId", "=", "Team.id"),
			).as("members"),
		])
		.where("Team.customUrl", "=", customUrl.toLowerCase())
		.executeTakeFirst();
}

export async function teamsByMemberUserId(
	userId: number,
	trx?: Transaction<DB>,
) {
	return (trx ?? db)
		.selectFrom("TeamMemberWithSecondary")
		.select([
			"TeamMemberWithSecondary.teamId as id",
			"TeamMemberWithSecondary.isOwner",
		])
		.where("userId", "=", userId)
		.execute();
}

export function switchMainTeam({
	userId,
	teamId,
}: {
	userId: number;
	teamId: number;
}) {
	return db.transaction().execute(async (trx) => {
		const currentTeams = await teamsByMemberUserId(userId, trx);

		const teamToSwitchTo = currentTeams.find((team) => team.id === teamId);
		invariant(teamToSwitchTo, "User is not a member of this team");

		await trx
			.updateTable("AllTeamMember")
			.set({
				isMainTeam: 0,
			})
			.where("userId", "=", userId)
			.execute();

		await trx
			.updateTable("AllTeamMember")
			.set({
				isMainTeam: 1,
			})
			.where("userId", "=", userId)
			.where("teamId", "=", teamId)
			.execute();
	});
}

export function addNewTeamMember({
	userId,
	teamId,
	maxTeamsAllowed,
}: {
	userId: number;
	teamId: number;
	maxTeamsAllowed: number;
}) {
	return db.transaction().execute(async (trx) => {
		const teamCount = (await teamsByMemberUserId(userId, trx)).length;

		if (teamCount >= maxTeamsAllowed) {
			throw new Error("Trying to exceed allowed team count");
		}

		const isMainTeam = Number(teamCount === 0);

		await trx
			.insertInto("AllTeamMember")
			.values({ userId, teamId, isMainTeam })
			.onConflict((oc) =>
				oc.columns(["userId", "teamId"]).doUpdateSet({
					leftAt: null,
					isMainTeam,
				}),
			)
			.execute();
	});
}

export function removeTeamMember({
	userId,
	teamId,
}: {
	userId: number;
	teamId: number;
}) {
	return db.transaction().execute(async (trx) => {
		const currentTeams = await teamsByMemberUserId(userId, trx);

		const teamToLeave = currentTeams.find((team) => team.id === teamId);
		invariant(teamToLeave, "User is not a member of this team");
		invariant(!teamToLeave.isOwner, "Owner cannot leave the team");

		const newMainTeam = currentTeams.find((team) => team.id !== teamId);
		if (newMainTeam) {
			await trx
				.updateTable("AllTeamMember")
				.set({
					isMainTeam: 1,
				})
				.where("userId", "=", userId)
				.where("teamId", "=", newMainTeam.id)
				.execute();
		}

		await trx
			.updateTable("AllTeamMember")
			.set({
				leftAt: databaseTimestampNow(),
			})
			.where("userId", "=", userId)
			.where("teamId", "=", teamId)
			.execute();
	});
}
