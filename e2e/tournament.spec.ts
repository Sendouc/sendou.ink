import { expect, test } from "@playwright/test";
import type { TournamentToolsLoaderData } from "~/features/tournament";
import {
  fetchSendouInk,
  impersonate,
  navigate,
  seed,
  submit,
} from "~/utils/playwright";
import { toToolsPage } from "~/utils/urls";

const fetchTournamentLoaderData = () =>
  fetchSendouInk<TournamentToolsLoaderData>(
    "/to/1/admin?_data=features%2Ftournament%2Froutes%2Fto.%24id"
  );
const getIsOwnerOfUser = ({
  data,
  userId,
  teamId,
}: {
  data: TournamentToolsLoaderData;
  userId: number;
  teamId: number;
}) => {
  return data.teams
    .find((t) => t.id === teamId)
    ?.members.find((m) => m.userId === userId)?.isOwner;
};

test.describe("Tournament", () => {
  test("operates admin controls", async ({ page }) => {
    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: toToolsPage(1),
    });

    await page.getByTestId("admin-tab").click();

    // Change team owner
    {
      let data = await fetchTournamentLoaderData();
      expect(getIsOwnerOfUser({ data, userId: 1, teamId: 1 })).toBe(1);

      await page.getByLabel("Action").selectOption("CHANGE_TEAM_OWNER");
      await page.getByLabel("Team").selectOption("1");
      await page.getByLabel("Member").selectOption("2");
      await submit(page);

      data = await fetchTournamentLoaderData();
      expect(getIsOwnerOfUser({ data, userId: 1, teamId: 1 })).toBe(0);
      expect(getIsOwnerOfUser({ data, userId: 2, teamId: 1 })).toBe(1);
    }
  });
});
