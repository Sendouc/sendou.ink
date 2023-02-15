import { expect, test } from "@playwright/test";
import {
  impersonate,
  navigate,
  seed,
  isNotVisible,
  selectWeapon,
} from "~/utils/playwright";
import { ANALYZER_URL } from "~/utils/urls";

test.describe("Build Analyzer", () => {
  test("analyzes a build and links to new build page with same abilities", async ({
    page,
  }) => {
    await seed(page);
    await impersonate(page, 1);
    await navigate({ page, url: ANALYZER_URL });

    const newBuildPrompt = page.getByTestId("new-build-prompt");

    await isNotVisible(newBuildPrompt);

    await selectWeapon({ page, name: "Splattershot" });

    await page.getByTestId("movement-category").click();

    const swimSpeedBase = page.getByTestId("swim-speed-base");
    const swimSpeedSplattershot = (await swimSpeedBase.textContent())!;

    await selectWeapon({ page, name: "Luna Blaster" });

    // Luna Blaster is a light weapon so it should have lower base swim speed than Splattershot
    await expect(swimSpeedBase).not.toHaveText(swimSpeedSplattershot);

    // shows comparison value when you have relevant abilities selected
    const swimSpeedBuildValueTitle = page.getByTestId("swim-speed-build-title");
    await isNotVisible(swimSpeedBuildValueTitle);
    await page.getByTestId("SSU-ability-button").click();
    await swimSpeedBuildValueTitle.isVisible();

    // on new build page with preselected values
    await newBuildPrompt.click();
    await expect(page).toHaveURL(/new/);
    await expect(page.getByTestId("weapon-combobox-input")).toHaveValue(
      "Luna Blaster"
    );
    await page.getByTestId("SSU-ability").isVisible();
  });

  test("compares builds", async ({ page }) => {
    await navigate({ page, url: ANALYZER_URL });

    await page.getByTestId("build2-tab").click();

    const swimSpeedAbilityButtonLocator =
      page.getByTestId("SSU-ability-button");
    const swimSpeedAbilityLocator = page.locator(
      "data-testid=ability-selector > data-testid=SSU-ability"
    );

    await swimSpeedAbilityButtonLocator.click();
    await swimSpeedAbilityLocator.isVisible();

    // can't add abilities to build 2 if build 1 is empty
    // -> they automatically go to build 1
    await page.getByTestId("build2-tab").click();
    await isNotVisible(swimSpeedAbilityLocator);

    await swimSpeedAbilityButtonLocator.click();
    await swimSpeedAbilityButtonLocator.click();

    await page.getByTestId("ap-tab").click();
    await page.getByText("10AP").isVisible();
    await page.getByText("13AP").isVisible();

    await page.getByTestId("swim-speed").getByText("BUILD 2").isVisible();
  });
});
