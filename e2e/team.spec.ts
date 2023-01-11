import { expect, test } from "@playwright/test";
import { navigate, seed, impersonate, submit } from "~/utils/playwright";
import { teamPage, TEAM_SEARCH_PAGE } from "~/utils/urls";

test.describe("Team search page", () => {
  test("filters teams", async ({ page }) => {
    await seed(page);
    await navigate({ page, url: TEAM_SEARCH_PAGE });

    const searchInput = page.getByTestId("team-search-input");
    const firstTeamName = page.getByTestId("team-0");
    const secondTeamName = page.getByTestId("team-1");

    await expect(firstTeamName).toHaveText("Alliance Rogue");
    await expect(secondTeamName).toBeVisible();

    await searchInput.type("Alliance Rogue");
    await expect(secondTeamName).not.toBeVisible();

    await firstTeamName.click();
    await expect(page).toHaveURL(/alliance-rogue/);
  });

  test("creates new team", async ({ page }) => {
    await seed(page);
    await impersonate(page, 2);
    await navigate({ page, url: TEAM_SEARCH_PAGE });

    await page.getByTestId("new-team-button").click();
    await expect(page).toHaveURL(/new=true/);
    await page.getByTestId("new-team-name-input").type("Team Olive");
    await submit(page);

    await expect(page).toHaveURL(/team-olive/);
  });
});

test.describe("Team page", () => {
  test("edit team info", async ({ page }) => {
    await seed(page);
    await impersonate(page, 1);
    await navigate({ page, url: teamPage("alliance-rogue") });

    await page.getByTestId("edit-team-button").click();

    await page.getByTestId("name-input").clear();
    await page.getByTestId("name-input").type("Better Alliance Rogue");

    await page.getByTestId("twitter-input").clear();
    await page.getByTestId("twitter-input").type("BetterAllianceRogue");

    await page.getByTestId("bio-textarea").clear();
    await page.getByTestId("bio-textarea").type("shorter bio");

    await submit(page);

    await expect(page).toHaveURL(/better-alliance-rogue/);
    await page.getByText("getByText").isVisible();
    // xxx: check twitter
  });
});
