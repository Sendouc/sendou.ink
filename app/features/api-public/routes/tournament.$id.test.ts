import { beforeEach, describe, expect, test } from "vitest";
import * as ImageFactory from "~/db/seed/factories/ImageFactory";
import * as TournamentFactory from "~/db/seed/factories/TournamentFactory";
import * as UserFactory from "~/db/seed/factories/UserFactory";
import { wrappedLoader } from "~/utils/Test";
import type { GetTournamentResponse } from "../schema";
import { loader } from "./tournament.$id";

const LOGO_FILE_NAME = "tournament-logo-abc-123.webp";

const users = UserFactory.pool();
const organizerId = () => users.id(1);

const tournamentLoader = wrappedLoader<Response>({ loader });

const fetchTournament = async (tournamentId: number) => {
	const response = await tournamentLoader({
		user: organizerId(),
		params: { id: String(tournamentId) },
	});

	return (await response.json()) as GetTournamentResponse;
};

describe("GET /api/tournament/:id", () => {
	beforeEach(async () => {
		await users.create(1);
	});

	test("returns the logo as a full URL", async () => {
		const logo = await ImageFactory.create(
			{ url: LOGO_FILE_NAME, submitterUserId: organizerId() },
			{ isValidated: true },
		);
		const tournament = await TournamentFactory.create({
			authorId: organizerId(),
			avatarImgId: logo.id,
		});

		const { logoUrl } = await fetchTournament(tournament.id);

		expect(logoUrl).toMatch(/^https?:\/\/.+\/tournament-logo-abc-123\.webp$/);
	});
});
