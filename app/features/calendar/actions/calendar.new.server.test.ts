import { addDays } from "date-fns";
import { beforeEach, describe, expect, test } from "vitest";
import * as BadgeFactory from "~/db/seed/factories/BadgeFactory";
import * as TournamentFactory from "~/db/seed/factories/TournamentFactory";
import * as TournamentOrganizationFactory from "~/db/seed/factories/TournamentOrganizationFactory";
import * as UserFactory from "~/db/seed/factories/UserFactory";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import invariant from "~/utils/invariant";
import { wrappedAction } from "~/utils/Test";
import type { calendarNewSchemaServer } from "../calendar-new-schemas.server";
import { defaultBracketsFormValues } from "../calendar-progression-form";
import { action } from "./calendar.new.server";

const editAction = wrappedAction<typeof calendarNewSchemaServer>({
	action,
	isJsonSubmission: true,
});

const users = UserFactory.pool();

const badgeManagingAuthorId = () => users.id(1);

describe("calendar new action: editing an event with badge prizes", () => {
	let orgAdminId: number;

	beforeEach(async () => {
		orgAdminId = (await UserFactory.createRegular()).id;
		await users.create(1);
	});

	const seedTournamentWithBadge = async () => {
		const org = await TournamentOrganizationFactory.create(
			{ ownerId: orgAdminId },
			{
				isEstablished: true,
				members: [{ userId: badgeManagingAuthorId(), role: "ADMIN" }],
			},
		);
		const badge = await BadgeFactory.create(null, {
			managerIds: [badgeManagingAuthorId()],
		});
		const tournament = await TournamentFactory.create({
			authorId: badgeManagingAuthorId(),
			organizationId: org.id,
			name: "Low Ink",
			badges: [badge.id],
		});

		return { org, badge, tournament };
	};

	const editFields = ({
		eventId,
		organizationId,
		badgeIds,
	}: {
		eventId: number;
		organizationId: number;
		badgeIds: number[];
	}) => ({
		toToolsEnabled: true,
		eventToEditId: eventId,
		name: "Low Ink (edited)",
		description: "",
		organizationId: String(organizationId),
		rules: "",
		date: [],
		startTime: addDays(new Date(), 7).toISOString() as never,
		bracketUrl: "https://sendou.ink",
		discordInviteCode: "",
		tags: [],
		badges: badgeIds,
		trophyId: null,
		avatarImgId: null,
		regClosesAt: "0" as const,
		minMembersPerTeam: "4" as const,
		maxMembersPerTeam: undefined,
		toToolsMode: "TO" as const,
		pool: "",
		...defaultBracketsFormValues(),
		isRanked: true,
		enableNoScreenToggle: true,
		enableSubs: true,
		autonomousSubs: true,
		requireInGameNames: false,
		isInvitational: false,
		isTest: false,
		isDraft: false,
		requireSendouQParticipation: false,
	});

	const badgePrizeIds = async (eventId: number) =>
		(
			await CalendarRepository.findById(eventId, { includeBadgePrizes: true })
		)?.badgePrizes?.map((badge) => badge.id);

	test("org admin editing keeps the badge the author attached", async () => {
		const { org, badge, tournament } = await seedTournamentWithBadge();

		await editAction(
			editFields({
				eventId: tournament.eventId,
				organizationId: org.id,
				badgeIds: [badge.id],
			}),
			{ user: "regular" },
		);

		const edited = await CalendarRepository.findById(tournament.eventId, {
			includeBadgePrizes: true,
		});
		expect(edited?.name).toBe("Low Ink (edited)");
		expect(edited?.badgePrizes?.map((prize) => prize.id)).toEqual([badge.id]);
	});

	test("badge managing author editing keeps the badge", async () => {
		const { org, badge, tournament } = await seedTournamentWithBadge();

		await editAction(
			editFields({
				eventId: tournament.eventId,
				organizationId: org.id,
				badgeIds: [badge.id],
			}),
			{ user: badgeManagingAuthorId() },
		);

		expect(await badgePrizeIds(tournament.eventId)).toEqual([badge.id]);
	});
});

describe("calendar new action: bracket URL", () => {
	beforeEach(async () => {
		await UserFactory.createRegular(null, { roles: ["TOURNAMENT_ORGANIZER"] });
	});

	const newEventFields = (
		overrides: Partial<Parameters<typeof editAction>[0]>,
	) => ({
		toToolsEnabled: false,
		name: "In The Zone",
		description: "",
		organizationId: "",
		rules: "",
		date: [addDays(new Date(), 7).toISOString() as never],
		startTime: null,
		bracketUrl: "",
		discordInviteCode: "",
		tags: [],
		badges: [],
		trophyId: null,
		avatarImgId: null,
		regClosesAt: "0" as const,
		minMembersPerTeam: "4" as const,
		maxMembersPerTeam: undefined,
		toToolsMode: "TO" as const,
		pool: "",
		...defaultBracketsFormValues(),
		isRanked: true,
		enableNoScreenToggle: true,
		enableSubs: true,
		autonomousSubs: true,
		requireInGameNames: false,
		isInvitational: false,
		isTest: false,
		isDraft: false,
		requireSendouQParticipation: false,
		...overrides,
	});

	test.each([
		{
			why: "missing",
			bracketUrl: "",
			expectedError: "forms:errors.bracketUrlRequired",
		},
		{
			why: "javascript: protocol",
			bracketUrl: "javascript:alert(1)",
			expectedError: "forms:errors.invalidUrl",
		},
	])("rejects bracket URL ($why)", async ({ bracketUrl, expectedError }) => {
		const res = await editAction(newEventFields({ bracketUrl }), {
			user: "regular",
		});

		expect(res.fieldErrors.bracketUrl).toBe(expectedError);
	});

	test("tournament with no bracket URL gets the default one", async () => {
		const res = await editAction(
			newEventFields({
				toToolsEnabled: true,
				date: [],
				startTime: addDays(new Date(), 7).toISOString() as never,
			}),
			{ user: "regular" },
		);

		expect(res.fieldErrors).toBeUndefined();

		const location =
			res instanceof Response ? res.headers.get("Location") : null;
		invariant(location, "expected a redirect to the created event");

		const created = await CalendarRepository.findById(
			Number(location.split("/").at(-1)),
		);
		expect(created?.bracketUrl).toBe("https://sendou.ink");
	});
});
