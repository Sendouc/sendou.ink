import { Page, test } from "@playwright/test";
import { NZAP_TEST_ID } from "~/db/seed/constants";
import { impersonate, navigate, seed } from "~/utils/playwright";
import { tournamentBracketsPage, tournamentPage } from "~/utils/urls";

const startBracket = async (page: Page) => {
  await seed(page);
  await impersonate(page);

  await navigate({
    page,
    url: tournamentBracketsPage(1),
  });

  await page.getByTestId("finalize-bracket-button").click();
};

test.describe("Tournament bracket", () => {
  test("reports score and sees bracket update", async ({ page }) => {
    await startBracket(page);

    await impersonate(page, NZAP_TEST_ID);
    await navigate({
      page,
      url: tournamentBracketsPage(1),
    });
  });
});
