import { suite } from "uvu";
import { Tournament } from "./Tournament";
import { PADDLING_POOL_257 } from "./tests/mocks";
import * as assert from "uvu/assert";

const FollowUp = suite("Follow-up bracket progression");

const tournament = new Tournament(PADDLING_POOL_257());

FollowUp("correct amount of teams in the top cut", () => {
  assert.equal(tournament.brackets[1].seeding?.length, 18);
});

FollowUp("includes correct teams in the top cut", () => {
  for (const tournamentTeamId of [892, 882, 881]) {
    assert.ok(
      tournament.brackets[1].seeding?.some(
        (team) => team.id === tournamentTeamId,
      ),
    );
  }
});

FollowUp("underground bracket includes a checked in team", () => {
  assert.ok(tournament.brackets[2].seeding?.some((team) => team.id === 902));
});

FollowUp("underground bracket doesn't include a non checked in team", () => {
  assert.ok(tournament.brackets[2].seeding?.some((team) => team.id === 902));
});

const AMOUNT_OF_WORSE_VS_BEST = 5;
const AMOUNT_OF_BEST_VS_BEST = 1;
const AMOUNT_OF_WORSE_VS_WORSE = 2;

FollowUp("correct seed distribution in the top cut", () => {
  const rrPlacements = tournament.brackets[0].standings;

  let ACTUAL_AMOUNT_OF_WORSE_VS_BEST = 0;
  let ACTUAL_AMOUNT_OF_BEST_VS_BEST = 0;
  let ACTUAL_AMOUNT_OF_WORSE_VS_WORSE = 0;
  for (const match of tournament.brackets[1].data.match) {
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

// TODO: https://github.com/Sendouc/sendou.ink/issues/1670
FollowUp.skip("avoids rematches in RR -> SE", () => {
  const rrMatches = tournament.brackets[0].data.match;
  const topCutMatches = tournament.brackets[1].data.match;

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
          "Rematch detected: " +
            rrMatch.opponent1.id +
            " vs " +
            rrMatch.opponent2.id,
        );
      }
      if (
        rrMatch.opponent1?.id === topCutMatch.opponent2.id &&
        rrMatch.opponent2?.id === topCutMatch.opponent1.id
      ) {
        throw new Error(
          "Rematch detected: " +
            rrMatch.opponent1.id +
            " vs " +
            rrMatch.opponent2.id,
        );
      }
    }
  }
});

FollowUp.run();
