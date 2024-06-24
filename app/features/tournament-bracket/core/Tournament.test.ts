import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { Match } from "~/modules/brackets-model";
import { Tournament } from "./Tournament";
import {
	IN_THE_ZONE_32,
	PADDLING_POOL_255,
	PADDLING_POOL_255_TOP_CUT_INITIAL_MATCHES,
	PADDLING_POOL_257,
} from "./tests/mocks";

const FollowUp = suite("Follow-up bracket progression");

const tournamentPP257 = new Tournament(PADDLING_POOL_257());
const tournamentPP255 = new Tournament(PADDLING_POOL_255());
const tournamentITZ32 = new Tournament(IN_THE_ZONE_32());

FollowUp("correct amount of teams in the top cut", () => {
	assert.equal(tournamentPP257.brackets[1].seeding?.length, 18);
});

FollowUp("includes correct teams in the top cut", () => {
	for (const tournamentTeamId of [892, 882, 881]) {
		assert.ok(
			tournamentPP257.brackets[1].seeding?.some(
				(team) => team === tournamentTeamId,
			),
		);
	}
});

FollowUp("underground bracket includes a checked in team", () => {
	assert.ok(tournamentPP257.brackets[2].seeding?.some((team) => team === 902));
});

FollowUp("underground bracket doesn't include a non checked in team", () => {
	assert.ok(tournamentPP257.brackets[2].seeding?.some((team) => team === 902));
});

FollowUp("underground bracket includes checked in teams (DE->SE)", () => {
	assert.equal(tournamentITZ32.brackets[1].seeding?.length, 4);
});

const AMOUNT_OF_WORSE_VS_BEST = 5;
const AMOUNT_OF_BEST_VS_BEST = 1;
const AMOUNT_OF_WORSE_VS_WORSE = 2;

FollowUp("correct seed distribution in the top cut", () => {
	const rrPlacements = tournamentPP257.brackets[0].standings;

	let ACTUAL_AMOUNT_OF_WORSE_VS_BEST = 0;
	let ACTUAL_AMOUNT_OF_BEST_VS_BEST = 0;
	let ACTUAL_AMOUNT_OF_WORSE_VS_WORSE = 0;
	for (const match of tournamentPP257.brackets[1].data.match) {
		const opponent1 = rrPlacements.find(
			(placement) => placement.team.id === match.opponent1?.id,
		);
		const opponent2 = rrPlacements.find(
			(placement) => placement.team.id === match.opponent2?.id,
		);

		if (!opponent1 || !opponent2) {
			continue;
		}

		const placementDiff = opponent1.placement - opponent2.placement;
		if (placementDiff === 0 && opponent1.placement === 1) {
			ACTUAL_AMOUNT_OF_BEST_VS_BEST++;
		} else if (placementDiff === 0 && opponent1.placement === 10) {
			ACTUAL_AMOUNT_OF_WORSE_VS_WORSE++;
		} else {
			ACTUAL_AMOUNT_OF_WORSE_VS_BEST++;
		}
	}

	assert.equal(
		ACTUAL_AMOUNT_OF_WORSE_VS_BEST,
		AMOUNT_OF_WORSE_VS_BEST,
		"Amount of worse vs best is incorrect",
	);
	assert.equal(
		ACTUAL_AMOUNT_OF_WORSE_VS_WORSE,
		AMOUNT_OF_WORSE_VS_WORSE,
		"Amount of worse vs worse is incorrect",
	);
	assert.equal(
		ACTUAL_AMOUNT_OF_BEST_VS_BEST,
		AMOUNT_OF_BEST_VS_BEST,
		"Amount of best vs best is incorrect",
	);
});

const validateNoRematches = (rrMatches: Match[], topCutMatches: Match[]) => {
	for (const topCutMatch of topCutMatches) {
		if (!topCutMatch.opponent1?.id || !topCutMatch.opponent2?.id) {
			continue;
		}

		for (const rrMatch of rrMatches) {
			if (
				rrMatch.opponent1?.id === topCutMatch.opponent1.id &&
				rrMatch.opponent2?.id === topCutMatch.opponent2.id
			) {
				throw new Error(
					`Rematch detected: ${rrMatch.opponent1.id} vs ${rrMatch.opponent2.id}`,
				);
			}
			if (
				rrMatch.opponent1?.id === topCutMatch.opponent2.id &&
				rrMatch.opponent2?.id === topCutMatch.opponent1.id
			) {
				throw new Error(
					`Rematch detected: ${rrMatch.opponent1.id} vs ${rrMatch.opponent2.id}`,
				);
			}
		}
	}
};

FollowUp("avoids rematches in RR -> SE (PP 257)", () => {
	const rrMatches = tournamentPP257.brackets[0].data.match;
	const topCutMatches = tournamentPP257.brackets[1].data.match;

	validateNoRematches(rrMatches, topCutMatches);
});

FollowUp("avoids rematches in RR -> SE (PP 255)", () => {
	const rrMatches = tournamentPP255.brackets[0].data.match;
	const topCutMatches = tournamentPP255.brackets[1].data.match;

	validateNoRematches(rrMatches, topCutMatches);
});

FollowUp("avoids rematches in RR -> SE (PP 255) - only minimum swap", () => {
	const oldTopCutMatches = PADDLING_POOL_255_TOP_CUT_INITIAL_MATCHES();
	const newTopCutMatches = tournamentPP255.brackets[1].data.match;

	let different = 0;

	for (const match of oldTopCutMatches) {
		if (!match.opponent1?.id || !match.opponent2?.id) {
			continue;
		}

		const newMatch = newTopCutMatches.find(
			(m) =>
				m.opponent1?.id === match.opponent1.id &&
				m.opponent2?.id === match.opponent2.id,
		);

		if (!newMatch) {
			different++;
		}
	}

	// 1 team should get swapped meaning two matches are now different
	assert.equal(different, 2, "Amount of different matches is incorrect");
});

FollowUp.run();
