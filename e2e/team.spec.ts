import { expect, test } from "@playwright/test";
import {
  navigate,
  seed,
  impersonate,
  submit,
  isNotVisible,
  modalClickConfirmButton,
} from "~/utils/playwright";
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

    await page.getByTestId("edit-team-submit-button").click();

    await expect(page).toHaveURL(/better-alliance-rogue/);
    await page.getByText("shorter bio").isVisible();
    await expect(page.getByTestId("twitter-link")).toHaveAttribute(
      "href",
      "https://twitter.com/BetterAllianceRogue"
    );
  });

  test("manages roster", async ({ page }) => {
    await seed(page);
    await impersonate(page, 1);
    await navigate({ page, url: teamPage("alliance-rogue") });

    await page.getByTestId("manage-roster-button").click();

    await page.getByTestId("role-select-0").selectOption("SUPPORT");

    await page.getByTestId("member-row-3").isVisible();
    // kick-button-0 is self
    await page.getByTestId("kick-button-1").click();
    await modalClickConfirmButton(page);
    await isNotVisible(page.getByTestId("member-row-3"));

    await page.getByTestId("transfer-ownership-button-1").click();
    await modalClickConfirmButton(page);

    await expect(page.getByTestId("member-row-role-0")).toHaveText("Support");

    await expect(page).not.toHaveURL(/roster/);
    await isNotVisible(page.getByTestId("manage-roster-button"));
  });

  test("deletes team", async ({ page }) => {
    await seed(page);
    await impersonate(page, 1);

    await navigate({ page, url: TEAM_SEARCH_PAGE });
    const firstTeamName = page.getByTestId("team-0");
    await firstTeamName.click();

    await page.getByTestId("edit-team-button").click();
    await page.getByTestId("delete-team-button").click();
    await modalClickConfirmButton(page);

    await expect(page).toHaveURL(TEAM_SEARCH_PAGE);
    await expect(page.getByTestId("team-0")).not.toHaveText("Alliance Rogue");
  });

  test("resets invite code, joins team, leaves, rejoins", async ({ page }) => {
    await seed(page);
    await impersonate(page, 1);
    await navigate({ page, url: teamPage("alliance-rogue") });

    await page.getByTestId("manage-roster-button").click();

    const oldInviteLink = await page.getByTestId("invite-link").innerText();

    await page.getByTestId("reset-invite-link-button").click();

    await expect(page.getByTestId("invite-link")).not.toHaveText(oldInviteLink);
    const newInviteLink = await page.getByTestId("invite-link").innerText();

    await impersonate(page, 2);

    await navigate({ page, url: newInviteLink });
    await submit(page);

    await page.getByTestId("leave-team-button").click();
    await modalClickConfirmButton(page);

    await navigate({ page, url: newInviteLink });
    await submit(page);

    await page.getByTestId("leave-team-button").isVisible();
  });
});
