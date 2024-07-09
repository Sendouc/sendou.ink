import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { mySlugify } from "~/utils/urls";

interface CreateArgs {
	ownerId: number;
	name: string;
}

export function create(args: CreateArgs) {
	return db.transaction().execute(async (trx) => {
		const org = await trx
			.insertInto("TournamentOrganization")
			.values({
				name: args.name,
				slug: mySlugify(args.name),
			})
			.returning("id")
			.executeTakeFirstOrThrow();

		return trx
			.insertInto("TournamentOrganizationMember")
			.values({
				organizationId: org.id,
				userId: args.ownerId,
				role: "ADMIN",
			})
			.execute();
	});
}

export function findBySlug(slug: string) {
	return db
		.selectFrom("TournamentOrganization")
		.select(({ eb }) => [
			"TournamentOrganization.name",
			"TournamentOrganization.description",
			"TournamentOrganization.socials",
			jsonArrayFrom(
				eb
					.selectFrom("TournamentOrganizationMember")
					.innerJoin("User", "User.id", "TournamentOrganizationMember.userId")
					.select([
						"TournamentOrganizationMember.role",
						"TournamentOrganizationMember.roleDisplayName",
						...COMMON_USER_FIELDS,
					])
					.whereRef(
						"TournamentOrganizationMember.organizationId",
						"=",
						"TournamentOrganization.id",
					),
			).as("members"),
			jsonArrayFrom(
				eb
					.selectFrom("TournamentOrganizationSeries")
					.select(["TournamentOrganizationSeries.name"])
					.whereRef(
						"TournamentOrganizationSeries.organizationId",
						"=",
						"TournamentOrganization.id",
					),
			).as("tournamentSeries"),
			jsonArrayFrom(
				eb
					.selectFrom("TournamentOrganizationBadge")
					.innerJoin("Badge", "Badge.id", "TournamentOrganizationBadge.badgeId")
					.select(["Badge.id", "Badge.displayName", "Badge.code", "Badge.hue"])
					.whereRef(
						"TournamentOrganizationBadge.organizationId",
						"=",
						"TournamentOrganization.id",
					),
			).as("badges"),
		])
		.where("TournamentOrganization.slug", "=", slug)
		.executeTakeFirst();
}
