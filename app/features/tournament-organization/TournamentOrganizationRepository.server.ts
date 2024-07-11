import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { mySlugify, userSubmittedImage } from "~/utils/urls";
import { HACKY_resolvePicture } from "../tournament/tournament-utils";

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
			"TournamentOrganization.id",
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

interface FindEventsByMonthArgs {
	month: number;
	year: number;
	organizationId: number;
}

export async function findEventsByMonth({
	month,
	year,
	organizationId,
}: FindEventsByMonthArgs) {
	const firstDayOfTheMonth = new Date(year, month, 1);
	const lastDayOfTheMonth = new Date(year, month + 1, 0);

	const events = await db
		.selectFrom("CalendarEvent")
		.innerJoin(
			"CalendarEventDate",
			"CalendarEventDate.eventId",
			"CalendarEvent.id",
		)
		.select(({ eb }) => [
			"CalendarEvent.id as eventId",
			"CalendarEvent.name",
			"CalendarEvent.tournamentId",
			"CalendarEventDate.startTime",
			eb
				.selectFrom("UserSubmittedImage")
				.select(["UserSubmittedImage.url"])
				.whereRef("CalendarEvent.avatarImgId", "=", "UserSubmittedImage.id")
				.as("logoUrl"),
			jsonObjectFrom(
				eb
					.selectFrom("TournamentResult")
					.innerJoin(
						"TournamentTeam",
						"TournamentTeam.id",
						"TournamentResult.tournamentTeamId",
					)
					.leftJoin("Team", "TournamentTeam.teamId", "Team.id")
					.leftJoin("UserSubmittedImage as u1", "Team.avatarImgId", "u1.id")
					.leftJoin(
						"UserSubmittedImage as u2",
						"TournamentTeam.avatarImgId",
						"u2.id",
					)
					.select(({ eb: innerEb }) => [
						"TournamentTeam.name",
						innerEb.fn.coalesce("u1.url", "u2.url").as("avatarUrl"),
						jsonArrayFrom(
							innerEb
								.selectFrom("TournamentTeamMember")
								.innerJoin("User", "User.id", "TournamentTeamMember.userId")
								.select([...COMMON_USER_FIELDS])
								.whereRef(
									"TournamentTeamMember.tournamentTeamId",
									"=",
									"TournamentTeam.id",
								)
								.orderBy("User.id asc"),
						).as("members"),
					])
					.whereRef(
						"TournamentResult.tournamentId",
						"=",
						"CalendarEvent.tournamentId",
					)
					.where("TournamentResult.placement", "=", 1),
			).as("tournamentWinners"),
			jsonObjectFrom(
				eb
					.selectFrom("CalendarEventResultTeam")
					.select(({ eb: innerEb }) => [
						"CalendarEventResultTeam.name",
						sql<null>`null`.as("avatarUrl"),
						jsonArrayFrom(
							innerEb
								.selectFrom("CalendarEventResultPlayer")
								.innerJoin(
									"User",
									"User.id",
									"CalendarEventResultPlayer.userId",
								)
								.select([...COMMON_USER_FIELDS])
								.whereRef(
									"CalendarEventResultPlayer.teamId",
									"=",
									"CalendarEventResultTeam.id",
								)
								.orderBy("User.id asc"),
						).as("members"),
					])
					.whereRef("CalendarEventResultTeam.eventId", "=", "CalendarEvent.id")
					.where("CalendarEventResultTeam.placement", "=", 1),
			).as("eventWinners"),
		])
		.where("CalendarEvent.organizationId", "=", organizationId)
		.where(
			"CalendarEventDate.startTime",
			">=",
			dateToDatabaseTimestamp(firstDayOfTheMonth),
		)
		.where(
			"CalendarEventDate.startTime",
			"<=",
			dateToDatabaseTimestamp(lastDayOfTheMonth),
		)
		.orderBy("CalendarEventDate.startTime asc")
		.execute();

	return events.map((event) => {
		return {
			...event,
			logoUrl: !event.tournamentId
				? null
				: event.logoUrl
					? userSubmittedImage(event.logoUrl)
					: HACKY_resolvePicture(event),
		};
	});
}
