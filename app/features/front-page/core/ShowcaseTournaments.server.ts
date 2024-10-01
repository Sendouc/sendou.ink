import type { NotNull } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import { tournamentIsRanked } from "~/features/tournament/tournament-utils";
import {
	databaseTimestampToDate,
	dateToDatabaseTimestamp,
} from "~/utils/dates";
import { COMMON_USER_FIELDS, type CommonUser } from "~/utils/kysely.server";

interface ShowcaseTournamentCollection {
	participatingFor: ShowcaseTournament[];
	organizingFor: ShowcaseTournament[];
	showcase: ShowcaseTournament[];
	results: ShowcaseTournament[];
}

export interface ShowcaseTournament {
	id: number;
	name: string;
	startTime: number;
	teamsCount: number;
	isRanked: boolean;
	logoUrl: string | null;
	organization: {
		name: string;
		slug: string;
	} | null;
	firstPlacer: {
		teamName: string;
		logoUrl: string | null;
		members: CommonUser[];
	} | null;
}

interface ParticipationInfo {
	participants: Set<ShowcaseTournament["id"]>;
	organizers: Set<ShowcaseTournament["id"]>;
}

export async function frontPageTournamentsByUserId(
	userId: number | null,
): Promise<ShowcaseTournamentCollection> {
	const tournaments = await cachedTournaments();
	const participation = await cachedParticipationInfo(
		userId,
		tournaments.upcoming,
	);

	return {
		organizingFor: tournaments.upcoming.filter((tournament) =>
			participation.organizers.has(tournament.id),
		),
		participatingFor: tournaments.upcoming.filter((tournament) =>
			participation.participants.has(tournament.id),
		),
		showcase: resolveShowcaseTournaments(
			tournaments.upcoming.filter(
				(tournament) =>
					!participation.organizers.has(tournament.id) &&
					!participation.participants.has(tournament.id),
			),
		),
		results: tournaments.results,
	};
}

let participationInfoMap: Map<CommonUser["id"], ParticipationInfo> | null =
	null;

const emptyParticipationInfo = (): ParticipationInfo => ({
	participants: new Set(),
	organizers: new Set(),
});

export function addToParticipationInfoMap({
	userId,
	tournamentId,
	type,
}: {
	userId: number;
	tournamentId: number;
	type: "participant" | "organizer";
}) {
	if (!participationInfoMap) return;

	const participation =
		participationInfoMap.get(userId) ?? emptyParticipationInfo();

	if (type === "participant") {
		participation.participants.add(tournamentId);
	} else if (type === "organizer") {
		participation.organizers.add(tournamentId);
	}

	participationInfoMap.set(userId, participation);
}

export function removeFromParticipationInfoMap({
	userId,
	tournamentId,
	type,
}: {
	userId: number;
	tournamentId: number;
	type: "participant" | "organizer";
}) {
	if (!participationInfoMap) return;

	const participation = participationInfoMap.get(userId);
	if (!participation) return;

	if (type === "participant") {
		participation.participants.delete(tournamentId);
	} else if (type === "organizer") {
		participation.organizers.delete(tournamentId);
	}

	participationInfoMap.set(userId, participation);
}

async function cachedParticipationInfo(
	userId: number | null,
	tournaments: ShowcaseTournament[],
): Promise<ParticipationInfo> {
	if (!userId) {
		return emptyParticipationInfo();
	}

	if (participationInfoMap) {
		return participationInfoMap.get(userId) ?? emptyParticipationInfo();
	}

	const participation = await tournamentsToParticipationInfoMap(tournaments);
	participationInfoMap = participation;

	return participation.get(userId) ?? emptyParticipationInfo();
}

// xxx: cache
async function cachedTournaments() {
	const tournaments = await tournamentsFromDB();

	const mapped = tournaments.map(mapTournamentFromDB);

	return deleteExtraResults(mapped);
}

function deleteExtraResults(tournaments: ShowcaseTournament[]) {
	const nonResults = tournaments.filter(
		(tournament) => !tournament.firstPlacer,
	);

	const rankedResults = tournaments
		.filter((tournament) => tournament.firstPlacer && tournament.isRanked)
		.sort((a, b) => b.teamsCount - a.teamsCount);
	const nonRankedResults = tournaments
		.filter((tournament) => tournament.firstPlacer && !tournament.isRanked)
		.sort((a, b) => b.teamsCount - a.teamsCount);

	const rankedResultsToKeep = rankedResults.slice(0, 4);
	// min 2, max 6 non ranked results
	// xxx: validate
	const nonRankedResultsToKeep = nonRankedResults.slice(
		0,
		Math.min(6, Math.max(2, nonRankedResults.length)),
	);

	return {
		results: [...rankedResultsToKeep, ...nonRankedResultsToKeep],
		upcoming: nonResults,
	};
}

// xxx: don't showcase tournaments without results that started more than 6 hours ago
function resolveShowcaseTournaments(
	tournaments: ShowcaseTournament[],
): ShowcaseTournament[] {
	const sorted = tournaments.sort((a, b) => b.teamsCount - a.teamsCount);

	const ranked = sorted.filter((tournament) => tournament.isRanked).slice(0, 3);
	// min 3, max 6 non ranked
	// xxx: validate
	const nonRanked = sorted
		.filter((tournament) => !tournament.isRanked)
		.slice(0, Math.min(6, Math.max(3, sorted.length)));

	return [...ranked, ...nonRanked].sort((a, b) => a.startTime - b.startTime);
}

async function tournamentsToParticipationInfoMap(
	tournaments: ShowcaseTournament[],
): Promise<Map<CommonUser["id"], ParticipationInfo>> {
	const tournamentIds = tournaments.map((tournament) => tournament.id);
	const tournamentsWithUsers =
		await tournamentRelatedUsersFromDB(tournamentIds);

	const result: Map<CommonUser["id"], ParticipationInfo> = new Map();

	const addToMap = (
		userId: number,
		tournamentId: number,
		type: "participant" | "organizer",
	) => {
		const participation = result.get(userId) ?? emptyParticipationInfo();

		if (type === "participant") {
			participation.participants.add(tournamentId);
		} else if (type === "organizer") {
			participation.organizers.add(tournamentId);
		}

		result.set(userId, participation);
	};

	for (const tournament of tournamentsWithUsers) {
		for (const { userId } of tournament.teamMembers) {
			addToMap(userId, tournament.id, "participant");
		}

		for (const { userId } of tournament.staff) {
			addToMap(userId, tournament.id, "organizer");
		}

		for (const { userId } of tournament.organizationMembers) {
			addToMap(userId, tournament.id, "organizer");
		}

		addToMap(tournament.authorId, tournament.id, "organizer");
	}

	return result;
}

function mapTournamentFromDB(
	tournament: Awaited<ReturnType<typeof tournamentsFromDB>>[number],
): ShowcaseTournament {
	return {
		id: tournament.id,
		name: tournament.name,
		startTime: tournament.startTime,
		teamsCount: tournament.teamsCount,
		logoUrl: tournament.logoUrl,
		organization: tournament.organization
			? {
					name: tournament.organization.name,
					slug: tournament.organization.slug,
				}
			: null,
		isRanked: tournamentIsRanked({
			isSetAsRanked: tournament.settings.isRanked,
			startTime: databaseTimestampToDate(tournament.startTime),
			minMembersPerTeam: tournament.settings.minMembersPerTeam ?? 4,
		}),
		firstPlacer:
			tournament.firstPlacers.length > 0
				? {
						teamName: tournament.firstPlacers[0].teamName,
						logoUrl: null,
						members: tournament.firstPlacers.map((firstPlacer) => ({
							customUrl: firstPlacer.customUrl,
							discordAvatar: firstPlacer.discordAvatar,
							discordId: firstPlacer.discordId,
							id: firstPlacer.id,
							username: firstPlacer.username,
						})),
					}
				: null,
	};
}

// xxx: to repo?
function tournamentsFromDB() {
	return db
		.selectFrom("Tournament")
		.innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
		.innerJoin(
			"CalendarEventDate",
			"CalendarEvent.id",
			"CalendarEventDate.eventId",
		)
		.select((eb) => [
			"Tournament.id",
			"Tournament.settings",
			"CalendarEvent.name",
			"CalendarEventDate.startTime",
			eb
				.selectFrom("TournamentTeam")
				// xxx: what if tournament is happening? then count is wrong
				// .innerJoin(
				// 	"TournamentTeamCheckIn",
				// 	"TournamentTeam.id",
				// 	"TournamentTeamCheckIn.tournamentTeamId",
				// )
				.whereRef("TournamentTeam.tournamentId", "=", "Tournament.id")
				.select(({ fn }) => [fn.countAll<number>().as("teamsCount")])
				.as("teamsCount"),
			eb
				.selectFrom("UserSubmittedImage")
				.select(["UserSubmittedImage.url"])
				.whereRef("CalendarEvent.avatarImgId", "=", "UserSubmittedImage.id")
				.as("logoUrl"),
			jsonObjectFrom(
				eb
					.selectFrom("TournamentOrganization")
					.select([
						"TournamentOrganization.name",
						"TournamentOrganization.slug",
					])
					.whereRef(
						"TournamentOrganization.id",
						"=",
						"CalendarEvent.organizationId",
					),
			).as("organization"),
			jsonArrayFrom(
				eb
					.selectFrom("TournamentResult")
					.innerJoin("User", "TournamentResult.userId", "User.id")
					.innerJoin(
						"TournamentTeam",
						"TournamentResult.tournamentTeamId",
						"TournamentTeam.id",
					)
					.whereRef("TournamentResult.tournamentId", "=", "Tournament.id")
					.where("TournamentResult.placement", "=", 1)
					.select([
						...COMMON_USER_FIELDS,
						"TournamentTeam.name as teamName",
						// xxx: logoUrl
					]),
			).as("firstPlacers"),
		])
		.where("CalendarEventDate.startTime", ">", databaseTimestampWeekAgo())
		.orderBy("CalendarEventDate.startTime asc")
		.$narrowType<{ teamsCount: NotNull }>()
		.execute();
}

// xxx: to repo?
function tournamentRelatedUsersFromDB(tournamentIds: number[]) {
	return db
		.selectFrom("Tournament")
		.innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
		.select((eb) => [
			"Tournament.id",
			"CalendarEvent.authorId",
			jsonArrayFrom(
				eb
					.selectFrom("TournamentStaff")
					.select(["TournamentStaff.userId"])
					.whereRef("TournamentStaff.tournamentId", "=", "Tournament.id")
					.where("TournamentStaff.role", "=", "ORGANIZER"),
			).as("staff"),
			jsonArrayFrom(
				eb
					.selectFrom("TournamentOrganization")
					.innerJoin(
						"TournamentOrganizationMember",
						"TournamentOrganization.id",
						"TournamentOrganizationMember.organizationId",
					)
					.select(["TournamentOrganizationMember.userId"])
					.whereRef(
						"TournamentOrganization.id",
						"=",
						"CalendarEvent.organizationId",
					)
					.where("TournamentOrganizationMember.role", "in", [
						"ADMIN",
						"ORGANIZER",
					]),
			).as("organizationMembers"),
			jsonArrayFrom(
				eb
					.selectFrom("TournamentTeam")
					.innerJoin(
						"TournamentTeamMember",
						"TournamentTeamMember.tournamentTeamId",
						"TournamentTeam.id",
					)
					.select(["TournamentTeamMember.userId"])
					.whereRef("TournamentTeam.tournamentId", "=", "Tournament.id"),
			).as("teamMembers"),
		])
		.where("Tournament.id", "in", tournamentIds)
		.$narrowType<{
			staff: NotNull;
			organizationMembers: NotNull;
			teamMembers: NotNull;
		}>()
		.execute();
}

function databaseTimestampWeekAgo() {
	const now = new Date();

	now.setDate(now.getDate() - 7);

	return dateToDatabaseTimestamp(now);
}
