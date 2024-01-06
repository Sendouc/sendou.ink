import test, { expect } from "@playwright/test";
import { ADMIN_ID } from "~/constants";
import { NZAP_TEST_ID } from "~/db/seed/constants";
import {
  impersonate,
  isNotVisible,
  modalClickConfirmButton,
  navigate,
  seed,
  selectUser,
  submit,
} from "~/utils/playwright";
import { tournamentAdminPage, tournamentBracketsPage } from "~/utils/urls";

const TOURNAMENT_ID = 1;

test.describe("Tournament staff", () => {
  test("gives and takes away staff role", async ({ page }) => {
    await seed(page);
    await impersonate(page, ADMIN_ID);

    await navigate({
      page,
      url: tournamentAdminPage(TOURNAMENT_ID),
    });

    await selectUser({
      page,
      userName: "N-ZAP",
      labelName: "New staff member",
    });

    await page.getByTestId("add-staff-button").click();
    await expect(page.getByTestId(`staff-id-${NZAP_TEST_ID}`)).toBeVisible();

    await page.getByTestId("remove-staff-button").click();
    await modalClickConfirmButton(page);
    await isNotVisible(page.getByTestId(`staff-id-${NZAP_TEST_ID}`));
  });

  test("gives organizer role which allows another user to TO", async ({
    page,
  }) => {
    await seed(page);
    await impersonate(page, NZAP_TEST_ID);

    await navigate({
      page,
      url: tournamentAdminPage(TOURNAMENT_ID),
    });

    // check that got redirected since has no access
    await page.waitForURL("**/register");

    await impersonate(page, ADMIN_ID);
    await navigate({
      page,
      url: tournamentAdminPage(TOURNAMENT_ID),
    });

    await selectUser({
      page,
      userName: "N-ZAP",
      labelName: "New staff member",
    });

    await page.getByTestId("add-staff-button").click();

    await impersonate(page, NZAP_TEST_ID);

    await navigate({
      page,
      url: tournamentAdminPage(TOURNAMENT_ID),
    });
    // organizer has no perms to add staff
    await isNotVisible(page.getByTestId("add-staff-button"));

    await page.getByLabel("Action").selectOption("CHECK_IN");
    await page.getByLabel("Team").selectOption("1");
    await submit(page);

    await navigate({
      page,
      url: tournamentBracketsPage(TOURNAMENT_ID),
    });

    await expect(page.getByTestId("finalize-bracket-button")).toBeVisible();
    await expect(page.getByText("Chimera")).toBeVisible();
  });
});
