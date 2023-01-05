import { expect, type Page, test } from "@playwright/test";
import { ADMIN_DISCORD_ID } from "~/constants";
import { impersonate, navigate, seed, selectWeapon } from "~/utils/playwright";
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

    await page.getByTestId("flag-FI").isVisible();
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

    await page.getByTestId("flag-SV").isVisible();
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

  test("edits weapon pool", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: userPage({ discordId: ADMIN_DISCORD_ID, customUrl: "sendou" }),
    });

    for (const [i, id] of [200, 1100, 2000, 4000].entries()) {
      await expect(page.getByTestId(`${id}-${i + 1}`)).toBeVisible();
    }

    await goToEditPage(page);
    await selectWeapon({ name: "Range Blaster", page });
    await page.getByText("Max weapon count reached").isVisible();
    await page.getByTestId("delete-weapon-1100").click();

    await submitEditForm(page);

    for (const [i, id] of [200, 2000, 4000, 220].entries()) {
      await expect(page.getByTestId(`${id}-${i + 1}`)).toBeVisible();
    }
  });
});
