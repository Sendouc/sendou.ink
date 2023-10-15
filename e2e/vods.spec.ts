import test, { expect } from "@playwright/test";
import {
  impersonate,
  isNotVisible,
  navigate,
  seed,
  selectUser,
  selectWeapon,
  submit,
} from "~/utils/playwright";
import { newVodPage, VODS_PAGE, vodVideoPage } from "~/utils/urls";

test.describe("VoDs page", () => {
  test("adds video (pov)", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: newVodPage(),
    });

    await page
      .getByLabel("YouTube URL")
      .type("https://www.youtube.com/watch?v=o7kWlMZP3lM");

    await page
      .getByLabel("Video title")
      .type("ITZXI Finals - Team Olive vs. Astral [CAMO TENTA PoV]");

    await page.getByLabel("Video date").fill("2021-06-20");

    await page.getByLabel("Type").selectOption("SCRIM");

    await selectUser({
      labelName: "Player (Pov)",
      page,
      userName: "Sendou",
    });

    await page.getByTestId("match-1-seconds").clear();
    await page.getByTestId("match-1-seconds").fill("20");
    await page.getByTestId("match-1-mode").selectOption("TC");
    await page.getByTestId("match-1-stage").selectOption("5");
    await selectWeapon({
      name: "Zink Mini Splatling",
      page,
      inputName: "match-1-weapon",
    });

    await page.getByTestId("add-match").click();

    await page.getByTestId("match-2-seconds").type("55");
    await page.getByTestId("match-2-minutes").type("5");
    await page.getByTestId("match-2-mode").selectOption("RM");
    await page.getByTestId("match-2-stage").selectOption("6");
    await selectWeapon({
      name: "Tenta Brella",
      page,
      inputName: "match-2-weapon",
    });

    await submit(page);

    await page.getByText("6/20/2021").isVisible();
    await page.getByTestId("weapon-img-4001").isVisible();
    await page.getByTestId("weapon-img-6010").isVisible();
  });

  test("adds video (cast)", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: newVodPage(),
    });

    await page
      .getByLabel("YouTube URL")
      .type("https://www.youtube.com/watch?v=QFk1Gf91SwI");

    await page
      .getByLabel("Video title")
      .type("BIG ! vs Starburst - Splatoon 3 Grand Finals - The Big House 10");

    await page.getByLabel("Video date").fill("2022-07-21");

    await page.getByLabel("Type").selectOption("CAST");

    await page.keyboard.press("Enter");

    await page.getByTestId("match-1-seconds").clear();
    await page.getByTestId("match-1-seconds").fill("25");
    await page.getByTestId("match-1-mode").selectOption("CB");
    await page.getByTestId("match-1-stage").selectOption("10");

    for (let i = 0; i < 8; i++) {
      await selectWeapon({
        name: i < 4 ? "Luna Blaster" : "Tenta Brella",
        page,
        inputName: `player-${i}-weapon`,
      });
    }

    await submit(page);

    for (let i = 0; i < 8; i++) {
      await page
        .getByTestId(`weapon-img-${i < 4 ? 200 : 6010}-${i}`)
        .isVisible();
    }
  });

  test("edits vod", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: vodVideoPage(1),
    });

    await page.getByTestId("edit-vod-button").click();

    await selectWeapon({
      name: "Luna Blaster",
      page,
      inputName: "match-4-weapon",
    });

    await submit(page);

    await expect(page).toHaveURL(vodVideoPage(1));

    await page.getByTestId(`weapon-img-200-4`).isVisible();
  });

  test("operates vod filters", async ({ page }) => {
    await seed(page);
    await impersonate(page);
    await navigate({
      page,
      url: VODS_PAGE,
    });

    await page.getByText("N-ZAP").isVisible();
    await selectWeapon({ page, name: "Carbon Roller" });
    await isNotVisible(page.getByText("N-ZAP"));
  });
});
