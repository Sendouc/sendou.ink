import { expect, type Page, test } from "@playwright/test";
import { ADMIN_DISCORD_ID } from "~/constants";
import { impersonate, navigate, seed } from "~/utils/playwright";
import { userPage } from "~/utils/urls";

const goToEditPage = (page: Page) =>
  page.getByText("Edit", { exact: true }).click();
const submitEditForm = (page: Page) =>
  page.getByText("Save", { exact: true }).click();

test.describe("User page", () => {
  test("edits user profile", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: userPage({ discordId: ADMIN_DISCORD_ID, customUrl: "sendou" }),
    });

    const country = page.getByTestId("country");

    await expect(country).toHaveText("Finland");
    await goToEditPage(page);

    await page
      .getByRole("textbox", { name: "In game name", exact: true })
      .fill("Lean");
    await page
      .getByRole("textbox", { name: "In game name discriminator" })
      .fill("1234");
    await page.getByLabel("R-stick sens").selectOption("0");
    await page.getByLabel("Motion sens").selectOption("-50");
    await page.getByLabel("Country").selectOption("SE");
    await page.getByLabel("Bio").type("My awesome bio");
    await submitEditForm(page);

    await expect(country).toHaveText("Sweden");
    await page.getByText("My awesome bio").isVisible();
    await page.getByText("Lean#1234").isVisible();
    await page.getByText("Stick 0 / Motion -5").isVisible();
  });

  test("has redirecting custom url", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: userPage({ discordId: ADMIN_DISCORD_ID }),
    });

    // got redirected
    await expect(page).toHaveURL(/sendou/);

    await goToEditPage(page);
    await page.getByLabel("Custom URL").fill("lean");
    await submitEditForm(page);

    await expect(page).toHaveURL(/lean/);
  });
});
