import { expect, test, type Page } from "@playwright/test";
import { ADMIN_DISCORD_ID } from "~/constants";
import { NZAP_TEST_ID } from "~/db/seed/constants";
import {
  impersonate,
  isNotVisible,
  navigate,
  seed,
  submit,
} from "~/utils/playwright";
import {
  tournamentAdminPage,
  tournamentBracketsPage,
  tournamentPage,
  userResultsPage,
} from "~/utils/urls";
import { startBracket } from "./shared";

const navigateToMatch = async (page: Page, matchId: number) => {
  await expect(async () => {
    await page.locator(`[data-match-id="${matchId}"]`).click();
    await expect(page.getByTestId("match-header")).toBeVisible();
  }).toPass();
};

const reportResult = async ({
  page,
  amountOfMapsToReport,
  sidesWithMoreThanFourPlayers = ["last"],
  winner = 1,
  points,
}: {
  page: Page;
  amountOfMapsToReport: 1 | 2 | 3 | 4;
  sidesWithMoreThanFourPlayers?: ("first" | "last")[];
  winner?: 1 | 2;
  points?: [number, number];
}) => {
  const fillPointsInput = async () => {
    if (!points) return;
    await page.getByTestId("points-input-1").fill(String(points[0]));
    await page.getByTestId("points-input-2").fill(String(points[1]));
  };

  await page.getByTestId("tab-Report score").click();

  if (sidesWithMoreThanFourPlayers.includes("first")) {
    await page.getByTestId("player-checkbox-0").first().click();
    await page.getByTestId("player-checkbox-1").first().click();
    await page.getByTestId("player-checkbox-2").first().click();
    await page.getByTestId("player-checkbox-3").first().click();
  }
  if (sidesWithMoreThanFourPlayers.includes("last")) {
    await page.getByTestId("player-checkbox-0").last().click();
    await page.getByTestId("player-checkbox-1").last().click();
    await page.getByTestId("player-checkbox-2").last().click();
    await page.getByTestId("player-checkbox-3").last().click();
  }

  await fillPointsInput();

  await page.getByTestId(`winner-radio-${winner}`).click();
  await page.getByTestId("report-score-button").click();
  await expect(page.getByText(winner === 1 ? "1-0" : "0-1")).toBeVisible();

  if (amountOfMapsToReport >= 2) {
    await page.getByTestId(`winner-radio-${winner}`).click();
    await fillPointsInput();
    await page.getByTestId("report-score-button").click();

    if (amountOfMapsToReport === 2) {
      await expect(page.getByTestId("report-timestamp")).toBeVisible();
    }
  }

  if (amountOfMapsToReport === 3) {
    await expect(page.getByText("2-0")).toBeVisible();

    await page.getByTestId(`winner-radio-${winner}`).click();
    await fillPointsInput();
    await page.getByTestId("report-score-button").click();

    await expect(page.getByTestId("report-timestamp")).toBeVisible();
  }

  if (amountOfMapsToReport === 4) {
    await expect(page.getByText("2-0")).toBeVisible();

    await page.getByTestId(`winner-radio-${winner}`).click();
    await fillPointsInput();
    await page.getByTestId("report-score-button").click();

    await expect(page.getByText("3-0")).toBeVisible();

    await page.getByTestId(`winner-radio-${winner}`).click();
    await page.getByTestId("report-score-button").click();

    await expect(page.getByTestId("report-timestamp")).toBeVisible();
  }
};

const backToBracket = async (page: Page) => {
  await page.getByTestId("back-to-bracket-button").click();
  await expect(page.getByTestId("brackets-viewer")).toBeVisible();
};

const expectScore = (page: Page, score: [number, number]) =>
  expect(page.getByText(score.join("-"))).toBeVisible();

// 1) Report winner of N-ZAP's first match
// 2) Report winner of the adjacent match by using admin powers
// 3) Report one match on the only losers side match available
// 4) Try to reopen N-ZAP's first match and fail
// 5) Undo score of first losers match
// 6) Try to reopen N-ZAP's first match and succeed
// 7) As N-ZAP, undo all scores and switch to different team sweeping
test.describe("Tournament bracket", () => {
  test("reports score and sees bracket update", async ({ page }) => {
    const tournamentId = 2;
    await startBracket(page);

    await impersonate(page, NZAP_TEST_ID);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    // 1)
    await navigateToMatch(page, 6);
    await reportResult({ page, amountOfMapsToReport: 2 });
    await backToBracket(page);

    // 2)
    await impersonate(page);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });
    await navigateToMatch(page, 5);
    await reportResult({ page, amountOfMapsToReport: 2 });
    await backToBracket(page);

    // 3)
    await navigateToMatch(page, 18);
    await reportResult({
      page,
      amountOfMapsToReport: 1,
      sidesWithMoreThanFourPlayers: ["first", "last"],
    });
    await backToBracket(page);

    // 4)
    await navigateToMatch(page, 6);
    await isNotVisible(page.getByTestId("reopen-match-button"));
    await backToBracket(page);

    // 5)
    await navigateToMatch(page, 18);
    await page.getByTestId("undo-score-button").click();
    await expectScore(page, [0, 0]);
    await backToBracket(page);

    // 6)
    await navigateToMatch(page, 6);
    await page.getByTestId("reopen-match-button").click();
    await expectScore(page, [1, 0]);

    // 7)
    await impersonate(page, NZAP_TEST_ID);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });
    await navigateToMatch(page, 6);
    await page.getByTestId("undo-score-button").click();
    await expectScore(page, [0, 0]);
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["last"],
      winner: 2,
    });
    await backToBracket(page);
    await expect(
      page.locator("[data-round-id='5'] [data-participant-id='102']"),
    ).toBeVisible();
  });

  test("adds a sub mid tournament (from non checked in team)", async ({
    page,
  }) => {
    const tournamentId = 1;
    await startBracket(page, tournamentId);

    // captain of the first team
    await impersonate(page, 5);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByTestId("add-sub-button").click();
    await page.getByTestId("copy-invite-link-button").click();

    const inviteLinkProd: string = await page.evaluate(
      "navigator.clipboard.readText()",
    );
    const inviteLink = inviteLinkProd.replace(
      "https://sendou.ink",
      "http://localhost:5173",
    );

    await impersonate(page, NZAP_TEST_ID);
    await navigate({
      page,
      url: inviteLink,
    });

    await submit(page);
    await expect(page).toHaveURL(/brackets/);
  });

  test("completes and finalizes a small tournament", async ({ page }) => {
    const tournamentId = 2;

    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentPage(tournamentId),
    });

    await page.getByTestId("admin-tab").click();

    await page.getByLabel("Action").selectOption("CHECK_OUT");

    for (let id = 103; id < 117; id++) {
      await page.getByLabel("Team").selectOption(String(id));
      await submit(page);
    }

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    await page.locator('[data-match-id="1"]').click();
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: [],
    });
    await backToBracket(page);

    await page.getByTestId("finalize-tournament-button").click();
    await page.getByTestId("confirm-button").click();

    await navigate({
      page,
      url: userResultsPage({ discordId: ADMIN_DISCORD_ID }),
    });

    await expect(page.getByText("In The Zone 22")).toBeVisible();
  });

  test("completes and finalizes a small tournament (RR->SE w/ underground bracket)", async ({
    page,
  }) => {
    const tournamentId = 3;

    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentPage(tournamentId),
    });

    await page.getByTestId("admin-tab").click();

    await page.getByLabel("Action").selectOption("CHECK_OUT");

    for (let id = 202; id < 210; id++) {
      await page.getByLabel("Team").selectOption(String(id));
      await submit(page);
    }

    await page.getByTestId("brackets-tab").click();
    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    for (const id of [2, 4, 6, 7, 8, 9, 10, 11, 12]) {
      await navigateToMatch(page, id);
      await reportResult({
        page,
        amountOfMapsToReport: 2,
        sidesWithMoreThanFourPlayers: ["first", "last"],
        points: [100, 0],
      });
      await backToBracket(page);
    }

    // captain of one of the underground bracket teams
    await impersonate(page, 57);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByRole("button", { name: "Underground" }).click();
    await page.getByTestId("check-in-bracket-button").click();

    await impersonate(page);
    await navigate({
      page,
      url: tournamentAdminPage(tournamentId),
    });

    await page.getByLabel("Action").selectOption("CHECK_IN");
    await page.getByLabel("Team").selectOption("216");
    await page
      .getByLabel("Bracket", { exact: true })
      .selectOption("Underground bracket");
    await submit(page);

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId, bracketIdx: 2 }),
    });
    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    await navigateToMatch(page, 13);
    await reportResult({
      page,
      amountOfMapsToReport: 3,
      sidesWithMoreThanFourPlayers: ["first", "last"],
    });

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId, bracketIdx: 1 }),
    });
    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();
    for (const matchId of [14, 15, 16, 17]) {
      await navigateToMatch(page, matchId);
      await reportResult({
        page,
        amountOfMapsToReport: 3,
        sidesWithMoreThanFourPlayers: ["first", "last"],
      });

      await backToBracket(page);
    }
    await page.getByTestId("finalize-tournament-button").click();
    await page.getByTestId("confirm-button").click();

    await expect(page.getByTestId("standing-1")).toBeVisible();

    // not possible to reopen finals match anymore
    await navigateToMatch(page, 14);
    await isNotVisible(page.getByTestId("reopen-match-button"));
    await backToBracket(page);

    // added result to user profile
    await page.getByTestId("standing-player").first().click();
    await page.getByText("Results").click();
    await expect(
      page.getByTestId("tournament-name-cell").first(),
    ).toContainText("Paddling Pool 253");
    await expect(
      page.locator('[data-testid="mates-cell-placement-0"] li'),
    ).toHaveCount(3);
  });

  test("changes SOS format and progresses with it", async ({ page }) => {
    const tournamentId = 4;

    await seed(page, "SMALL_SOS");
    await impersonate(page);

    await navigate({
      page,
      url: tournamentAdminPage(tournamentId),
    });

    await page.getByTestId("edit-event-info-button").click();
    await page.getByLabel("Auto check-in to follow-up brackets").check();
    await page.getByTestId("remove-bracket").click();
    await page.getByTestId("placement-3-4").click();

    await submit(page);

    await page.getByTestId("brackets-tab").click();
    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    for (const matchId of [1, 2, 3, 4, 5, 6]) {
      await page.locator(`[data-match-id="${matchId}"]`).click();
      await reportResult({
        page,
        amountOfMapsToReport: 2,
        sidesWithMoreThanFourPlayers: [],
        points: [100, 0],
      });
      await backToBracket(page);
    }

    await page.getByRole("button", { name: "Hammerhead" }).click();
    await isNotVisible(page.getByTestId("brackets-viewer"));

    await page.getByRole("button", { name: "Mako" }).click();
    await expect(page.getByTestId("brackets-viewer")).toBeVisible();

    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    await page.locator('[data-match-id="7"]').click();
    await expect(page.getByTestId("back-to-bracket-button")).toBeVisible();
  });

  test("changes to picked map pool & best of", async ({ page }) => {
    const tournamentId = 4;

    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentAdminPage(tournamentId),
    });

    await page.getByTestId("edit-event-info-button").click();

    await page.getByRole("button", { name: "Clear" }).click();
    await page.getByLabel("Template").selectOption("preset:CB");

    await submit(page);

    await page.getByTestId("brackets-tab").click();
    await page.getByTestId("finalize-bracket-button").click();
    await page.getByLabel("Count").selectOption("5");
    await page.getByTestId("confirm-finalize-bracket-button").click();

    await page.locator('[data-match-id="1"]').click();
    await expect(page.getByTestId("mode-progress-CB")).toHaveCount(5);
  });

  test("reopens round robin match and changes score", async ({ page }) => {
    const tournamentId = 3;

    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    // set situation where match A is completed and its participants also completed their follow up matches B & C
    // and then we go back and change the winner of A
    await navigateToMatch(page, 8);
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["first"],
      points: [100, 0],
    });
    await backToBracket(page);

    await navigateToMatch(page, 9);
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["last"],
      points: [100, 0],
    });
    await backToBracket(page);

    await navigateToMatch(page, 10);
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["last"],
      points: [100, 0],
    });
    await backToBracket(page);

    await navigateToMatch(page, 8);
    await page.getByTestId("reopen-match-button").click();
    await page.getByTestId("undo-score-button").click();
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["first"],
      points: [0, 100],
      winner: 2,
    });
  });

  test("locks/unlocks matches & sets match as casted", async ({ page }) => {
    const tournamentId = 2;

    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentPage(tournamentId),
    });

    await page.getByTestId("admin-tab").click();

    await page.getByLabel("Action").selectOption("CHECK_OUT");

    for (let id = 103; id < 115; id++) {
      await page.getByLabel("Team").selectOption(String(id));
      await submit(page);
    }

    await page.getByLabel("Twitch accounts").fill("test");
    await page.getByTestId("save-cast-twitch-accounts-button").click();

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    await page.locator('[data-match-id="1"]').click();
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["last"],
    });
    await backToBracket(page);

    await page.locator('[data-match-id="3"]').click();
    await page.getByTestId("cast-info-submit-button").click();
    await backToBracket(page);

    await page.locator('[data-match-id="2"]').click();
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["last"],
    });
    await backToBracket(page);

    await expect(page.getByText("⚪ CAST")).toBeVisible();
    await page.locator('[data-match-id="3"]').click();
    await expect(page.getByText("Match locked to be casted")).toBeVisible();
    await page.getByTestId("cast-info-submit-button").click();
    await expect(page.getByTestId("stage-banner")).toBeVisible();

    await page.getByTestId("cast-info-select").selectOption("test");
    await page.getByTestId("cast-info-submit-button").click();
    await backToBracket(page);
    await expect(page.getByText("🔴 LIVE")).toBeVisible();
  });

  test("resets bracket", async ({ page }) => {
    const tournamentId = 1;

    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();

    await isNotVisible(page.locator('[data-match-id="1"]'));
    await page.locator('[data-match-id="2"]').click();
    await reportResult({
      page,
      amountOfMapsToReport: 2,
      sidesWithMoreThanFourPlayers: ["last"],
    });

    await page.getByTestId("admin-tab").click();
    await page
      .getByLabel('Type bracket name ("Main bracket") to confirm')
      .fill("Main bracket");
    await page.getByTestId("reset-bracket-button").click();

    await page.getByLabel("Action").selectOption("CHECK_IN");
    await page.getByLabel("Team").selectOption("1");
    await submit(page);

    await page.getByTestId("brackets-tab").click();
    await page.getByTestId("finalize-bracket-button").click();
    await page.getByTestId("confirm-finalize-bracket-button").click();
    // bye is gone
    await expect(page.locator('[data-match-id="1"]')).toBeVisible();
  });
});
