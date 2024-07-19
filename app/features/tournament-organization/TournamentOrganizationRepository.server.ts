import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { Tables } from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { mySlugify, userSubmittedImage } from "~/utils/urls";
import { HACKY_resolvePicture } from "../tournament/tournament-utils";
import { TOURNAMENT_SERIES_EVENTS_PER_PAGE } from "./tournament-organization-constants";

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
			"TournamentOrganization.slug",
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
					.select([
						"TournamentOrganizationSeries.id",
						"TournamentOrganizationSeries.name",
						"TournamentOrganizationSeries.substringMatches",
						"TournamentOrganizationSeries.showLeaderboard",
						"TournamentOrganization.description",
					])
					.whereRef(
						"TournamentOrganizationSeries.organizationId",
						"=",
						"TournamentOrganization.id",
					),
			).as("series"),
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

const findEventsBaseQuery = (organizationId: number) =>
	db
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
					.leftJoin("AllTeam", "TournamentTeam.teamId", "AllTeam.id")
					.leftJoin("UserSubmittedImage as u1", "AllTeam.avatarImgId", "u1.id")
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
								.select(["User.discordAvatar", "User.discordId"])
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
								.select(["User.discordAvatar", "User.discordId"])
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
		.where("CalendarEvent.organizationId", "=", organizationId);

const mapEvent = <
	T extends {
		tournamentId: number | null;
		logoUrl: string | null;
		name: string;
	},
>(
	event: T,
) => {
	return {
		...event,
		logoUrl: !event.tournamentId
			? null
			: event.logoUrl
				? userSubmittedImage(event.logoUrl)
				: HACKY_resolvePicture(event),
	};
};

export async function findEventsByMonth({
	month,
	year,
	organizationId,
}: FindEventsByMonthArgs) {
	const firstDayOfTheMonth = new Date(year, month, 1);
	const lastDayOfTheMonth = new Date(year, month + 1, 0);

	const events = await findEventsBaseQuery(organizationId)
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

	return events.map(mapEvent);
}

const findSeriesEventsBaseQuery = ({
	organizationId,
	substringMatches,
}: {
	organizationId: number;
	substringMatches: string[];
}) =>
	findEventsBaseQuery(organizationId)
		.where((eb) =>
			eb.or(
				substringMatches.map((match) =>
					eb("CalendarEvent.name", "like", `%${match}%`),
				),
			),
		)
		.orderBy("CalendarEventDate.startTime desc");

export async function findPaginatedEventsBySeries({
	organizationId,
	substringMatches,
	page,
}: {
	organizationId: number;
	substringMatches: string[];
	page: number;
}) {
	const events = await findSeriesEventsBaseQuery({
		organizationId,
		substringMatches,
	})
		.limit(TOURNAMENT_SERIES_EVENTS_PER_PAGE)
		.offset((page - 1) * TOURNAMENT_SERIES_EVENTS_PER_PAGE)
		.execute();

	return events.map(mapEvent);
}

export async function findAllEventsBySeries({
	organizationId,
	substringMatches,
}: {
	organizationId: number;
	substringMatches: string[];
}) {
	const events = await findSeriesEventsBaseQuery({
		organizationId,
		substringMatches,
	}).execute();

	return events.map(mapEvent);
}

interface UpdateArgs
	extends Pick<
		Tables["TournamentOrganization"],
		"id" | "name" | "description" | "socials"
	> {
	members: Array<
		Pick<
			Tables["TournamentOrganizationMember"],
			"role" | "roleDisplayName" | "userId"
		>
	>;
}

export function update({
	id,
	name,
	description,
	socials,
	members,
}: UpdateArgs) {
	return db.transaction().execute(async (trx) => {
		const updatedOrg = await trx
			.updateTable("TournamentOrganization")
			.set({
				name,
				description,
				slug: mySlugify(name),
				socials: JSON.stringify(socials),
			})
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirstOrThrow();

		await trx
			.deleteFrom("TournamentOrganizationMember")
			.where("organizationId", "=", id)
			.execute();

		await trx
			.insertInto("TournamentOrganizationMember")
			.values(
				members.map((member) => ({
					organizationId: id,
					...member,
				})),
			)
			.execute();

		return updatedOrg;
	});
}
