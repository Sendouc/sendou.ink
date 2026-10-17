import { redirect } from "react-router";
import { requireUser } from "~/features/auth/core/user.server";
import * as BadgeRepository from "~/features/badges/BadgeRepository.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import * as ShowcaseTournaments from "~/features/front-page/core/ShowcaseTournaments.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { notify } from "~/features/notifications/core/notify.server";
import * as Progression from "~/features/tournament-bracket/core/Progression";
import {
	clearTournamentDataCache,
	tournamentFromDB,
} from "~/features/tournament-bracket/core/Tournament.server";
import * as TrophyRepository from "~/features/trophies/TrophyRepository.server";
import { defineAction } from "~/form/define-action.server";
import {
	requirePermission,
	requireRole,
} from "~/modules/permissions/guards.server";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import {
	badRequestIfFalsy,
	errorToast,
	errorToastIfFalsy,
} from "~/utils/remix.server";
import { pathnameFromPotentialURL } from "~/utils/strings";
import { calendarEventPage } from "~/utils/urls";
import { CALENDAR_EVENT } from "../calendar-constants";
import {
	calendarNewSchema,
	customTeamPickPool,
	teamPickSettingsFromFormValues,
} from "../calendar-new-schemas";
import { formValuesToInputBrackets } from "../calendar-progression-form";
import type { CalendarEventTag } from "../calendar-types";
import { findValidOrganizations } from "../loaders/calendar.new.server";

export const action = defineAction(
	{ body: calendarNewSchema },
	async ({ body, resolveImages }) => {
		const user = requireUser();

		const isEditing = Boolean(body.eventToEditId);
		const isAddingTournament = body.toToolsEnabled;
		const isTournamentAdder = user.roles.includes("TOURNAMENT_ADDER");
		const organizationId = body.organizationId
			? Number(body.organizationId)
			: null;

		await requireCanAddToOrganization({
			userId: user.id,
			organizationId,
			isTournamentAdder,
			isEditing,
			isAddingTournament,
		});

		if (body.trophyId) {
			await validateTrophyOrganization({
				trophyId: body.trophyId,
				organizationId,
			});
		}

		const { eventToEdit, tournamentToEdit } = await findEditableEvent(
			body.eventToEditId,
			user,
		);

		const data = await resolveImages({
			isCurrentImgId: async (imgId) =>
				(
					await CalendarRepository.findAvatarImgIds({
						eventId: body.eventToEditId,
						tournamentId: body.tournamentToCopyId,
					})
				).includes(imgId),
		});

		const managedBadges = await BadgeRepository.findManagedByUserId(user.id);
		const attachableBadgeIds = new Set([
			...managedBadges.map((badge) => badge.id),
			...(eventToEdit?.badgePrizes ?? []).map((badge) => badge.id),
		]);

		const dates =
			isAddingTournament && data.startTime ? [data.startTime] : data.date;
		const startTimes = dates.map((date) => dateToDatabaseTimestamp(date));
		const commonArgs = {
			authorId: user.id,
			organizationId,
			name: data.name,
			description: data.description,
			rules: data.rules,
			startTimes,
			bracketUrl: data.bracketUrl || "https://sendou.ink",
			discordInviteCode: data.discordInviteCode
				? pathnameFromPotentialURL(data.discordInviteCode)
				: data.discordInviteCode,
			tags: sortedTagsOrNull(data.tags),
			badges: data.trophyId
				? []
				: data.badges.filter((badge) => attachableBadgeIds.has(badge)),
			trophyId: data.trophyId ?? null,
			// resolved by resolveImages from the `image()` field
			avatarImgId: data.avatarImgId ?? undefined,
			toToolsEnabled: data.toToolsEnabled,
			mapPickingStyle: data.mapPickingStyle,
			teamPick:
				isAddingTournament && data.mapPickingStyle === "AUTO"
					? teamPickSettingsFromFormValues(data)
					: undefined,
			bracketProgression: bracketProgressionFromFormData(data),
			minMembersPerTeam: Number(data.minMembersPerTeam),
			maxMembersPerTeam:
				data.minMembersPerTeam === "4" && data.maxMembersPerTeam
					? data.maxMembersPerTeam
					: undefined,
			isRanked: data.isRanked,
			isTest: data.isTest,
			isLeague: data.isLeague,
			isDraft: data.isDraft,
			isInvitational: data.isInvitational,
			enableNoScreenToggle: data.enableNoScreenToggle,
			enableSubs: data.enableSubs,
			requireInGameNames: data.requireInGameNames,
			autonomousSubs: data.autonomousSubs,
			tournamentToCopyId: data.tournamentToCopyId,
			regClosesAt: isAddingTournament ? regClosesAtTimestamp(data) : undefined,
		};
		errorToastIfFalsy(
			!commonArgs.toToolsEnabled || commonArgs.bracketProgression,
			"Bracket progression must be set for tournaments",
		);

		const deserializedMaps = (() => {
			if (!isAddingTournament || data.mapPickingStyle === "TO") {
				return data.pool ? MapPool.toDbList(data.pool) : undefined;
			}

			return data.teamPickPool === "CUSTOM" ? customTeamPickPool(data) : [];
		})();

		if (eventToEdit) {
			// once published, a tournament can't be flipped back to draft
			if (tournamentToEdit && !tournamentToEdit.isDraft) {
				commonArgs.isDraft = false;
			}

			await CalendarRepository.update({
				eventId: eventToEdit.eventId,
				mapPoolMaps: deserializedMaps,
				...commonArgs,
			});

			if (eventToEdit.tournamentId) {
				clearTournamentDataCache(eventToEdit.tournamentId);
				ShowcaseTournaments.clearParticipationInfoMap();
			}

			throw redirect(calendarEventPage(eventToEdit.eventId));
		}

		const { eventId: createdEventId, tournamentId: createdTournamentId } =
			await CalendarRepository.insert({
				mapPoolMaps: deserializedMaps,
				isFullTournament: data.toToolsEnabled,
				...commonArgs,
			});

		if (createdTournamentId) {
			onTournamentCreated({
				tournamentId: createdTournamentId,
				tournamentName: data.name,
				isTest: data.isTest,
				userId: user.id,
			});
		}

		throw redirect(calendarEventPage(createdEventId));
	},
);

function sortedTagsOrNull(tags: CalendarEventTag[]) {
	if (tags.length === 0) return null;

	return tags.toSorted(
		(a, b) => CALENDAR_EVENT.TAGS.indexOf(a) - CALENDAR_EVENT.TAGS.indexOf(b),
	);
}

function regClosesAtTimestamp(data: {
	isInvitational: boolean;
	regClosesAt?: Date | null;
}) {
	if (data.isInvitational || !data.regClosesAt) return undefined;

	return dateToDatabaseTimestamp(data.regClosesAt);
}

/** Bracket progression from the `brackets` + `progression` fields, already validated by the schema's refine. */
function bracketProgressionFromFormData(data: {
	toToolsEnabled: boolean;
	brackets: Parameters<typeof formValuesToInputBrackets>[0];
	progression: Parameters<typeof formValuesToInputBrackets>[1];
}) {
	if (!data.toToolsEnabled || data.brackets.length === 0) return null;

	const validated = Progression.validatedBrackets(
		formValuesToInputBrackets(data.brackets, data.progression),
	);

	return Progression.isBrackets(validated) ? validated : null;
}

async function requireCanAddToOrganization({
	userId,
	organizationId,
	isTournamentAdder,
	isEditing,
	isAddingTournament,
}: {
	userId: number;
	organizationId: number | null;
	isTournamentAdder: boolean;
	isEditing: boolean;
	isAddingTournament: boolean;
}) {
	if (organizationId) {
		await validateOrganization({ userId, organizationId, isTournamentAdder });
	} else if (!isEditing) {
		requireRole(
			isAddingTournament ? "TOURNAMENT_ADDER" : "CALENDAR_EVENT_ADDER",
		);
	}
}

async function validateTrophyOrganization({
	trophyId,
	organizationId,
}: {
	trophyId: number;
	organizationId: number | null;
}) {
	const trophyOrganizationId =
		await TrophyRepository.findOrganizationIdById(trophyId);
	if (trophyOrganizationId !== organizationId) {
		errorToast("Trophy does not belong to the selected organization");
	}
}

async function findEditableEvent(
	eventToEditId: number | undefined,
	user: ReturnType<typeof requireUser>,
) {
	const eventToEdit = eventToEditId
		? badRequestIfFalsy(
				await CalendarRepository.findById(eventToEditId, {
					includeBadgePrizes: true,
				}),
			)
		: null;

	const tournamentToEdit = eventToEdit?.tournamentId
		? await tournamentFromDB(eventToEdit.tournamentId)
		: null;
	if (tournamentToEdit) {
		errorToastIfFalsy(
			!tournamentToEdit.hasStarted,
			"Tournament has already started",
		);
		errorToastIfFalsy(
			tournamentToEdit.canEditEventInfo(user),
			"Not authorized",
		);
	} else if (eventToEdit) {
		requirePermission(eventToEdit, "EDIT");
	}

	return { eventToEdit, tournamentToEdit };
}

function onTournamentCreated({
	tournamentId,
	tournamentName,
	isTest,
	userId,
}: {
	tournamentId: number;
	tournamentName: string;
	isTest: boolean;
	userId: number;
}) {
	clearTournamentDataCache(tournamentId);
	ShowcaseTournaments.clearParticipationInfoMap();
	ShowcaseTournaments.clearCachedTournaments();

	if (isTest) {
		void notify({
			notification: {
				type: "TO_TEST_CREATED",
				meta: { tournamentName, tournamentId },
			},
			defaultSeenUserIds: [userId],
			userIds: [userId],
		});
	}
}

/** The user may create a tournament in this organization. */
async function validateOrganization({
	userId,
	organizationId,
	isTournamentAdder,
}: {
	userId: number;
	organizationId: number;
	isTournamentAdder: boolean;
}) {
	const orgs = await findValidOrganizations(userId, isTournamentAdder);

	const isValid = orgs.some(
		(org) => typeof org !== "string" && org.id === organizationId,
	);

	if (!isValid) errorToast("Not authorized to add event for this organization");
}
