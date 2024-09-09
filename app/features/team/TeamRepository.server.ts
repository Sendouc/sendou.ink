import type { Transaction } from "kysely";
import { db } from "~/db/sql";
import type { DB } from "~/db/tables";
import { databaseTimestampNow } from "~/utils/dates";
import invariant from "~/utils/invariant";

export function findByUserId(userId: number) {
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
