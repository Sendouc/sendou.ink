import { type Page, test, expect } from "@playwright/test";
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
    await page.locator('[data-match-id="5"]').click();
    await reportResult({ page, amountOfMapsToReport: tournamentId });
    await backToBracket(page);

    // 2)
    await impersonate(page);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });
    await navigateToMatch(page, 6);
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
    await navigateToMatch(page, 5);
    await isNotVisible(page.getByTestId("reopen-match-button"));
    await backToBracket(page);

    // 5)
    await navigateToMatch(page, 18);
    await page.getByTestId("undo-score-button").click();
    await expectScore(page, [0, 0]);
    await backToBracket(page);

    // 6)
    await navigateToMatch(page, 5);
    await page.getByTestId("reopen-match-button").click();
    await expectScore(page, [1, 0]);

    // 7)
    await impersonate(page, NZAP_TEST_ID);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });
    await navigateToMatch(page, 5);
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
      "http://localhost:5800",
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

    await page.locator('[data-match-id="1"]').click();
    await reportResult({
      page,
      amountOfMapsToReport: 4,
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

    await page.getByTestId("edit-event-info-button").click();

    await page
      .getByLabel("Amount of teams advancing per group")
      .selectOption("1");

    await submit(page);

    await page.getByTestId("brackets-tab").click();
    await page.getByTestId("finalize-bracket-button").click();

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
    await impersonate(page, 52);
    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId }),
    });

    await page.getByText("Underground bracket").click();
    await page.getByTestId("check-in-bracket-button").click();

    await impersonate(page);
    await navigate({
      page,
      url: tournamentAdminPage(tournamentId),
    });

    await page.getByLabel("Action").selectOption("CHECK_IN");
    await page.getByLabel("Team").selectOption("216");
    await page.getByLabel("Bracket").selectOption("Underground bracket");
    await submit(page);

    await navigate({
      page,
      url: tournamentBracketsPage({ tournamentId, bracketIdx: 2 }),
    });
    await page.getByTestId("finalize-bracket-button").click();

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
    await navigateToMatch(page, 14);
    await reportResult({
      page,
      amountOfMapsToReport: 3,
      sidesWithMoreThanFourPlayers: ["first", "last"],
    });

    await backToBracket(page);
    await page.getByTestId("finalize-tournament-button").click();
    await page.getByTestId("confirm-button").click();

    await expect(page.getByTestId("standing-1")).toBeVisible();
    await isNotVisible(page.getByTestId("standing-3"));

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
});
