import { expect, test } from "@playwright/test";
import invariant from "tiny-invariant";
import type { TournamentToolsLoaderData } from "~/features/tournament";
import {
  fetchSendouInk,
  impersonate,
  isNotVisible,
  navigate,
  seed,
  selectUser,
  submit,
} from "~/utils/playwright";
import { tournamentBracketsPage, tournamentPage } from "~/utils/urls";

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
  const team = data.teams.find((t) => t.id === teamId);
  invariant(team, "Team not found");

  return team.members.find((m) => m.userId === userId)?.isOwner;
};

const getTeamCheckedInAt = ({
  data,
  teamId,
}: {
  data: TournamentToolsLoaderData;
  teamId: number;
}) => {
  const team = data.teams.find((t) => t.id === teamId);
  invariant(team, "Team not found");
  return team.checkedInAt;
};

test.describe("Tournament", () => {
  test("operates admin controls", async ({ page }) => {
    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentPage(1),
    });

    await page.getByTestId("admin-tab").click();

    const actionSelect = page.getByLabel("Action");
    const teamSelect = page.getByLabel("Team");
    const memberSelect = page.getByLabel("Member");

    // Change team owner
    let data = await fetchTournamentLoaderData();
    expect(getIsOwnerOfUser({ data, userId: 1, teamId: 1 })).toBe(1);

    await actionSelect.selectOption("CHANGE_TEAM_OWNER");
    await teamSelect.selectOption("1");
    await memberSelect.selectOption("2");
    await submit(page);

    data = await fetchTournamentLoaderData();
    expect(getIsOwnerOfUser({ data, userId: 1, teamId: 1 })).toBe(0);
    expect(getIsOwnerOfUser({ data, userId: 2, teamId: 1 })).toBe(1);

    // Check in team
    expect(getTeamCheckedInAt({ data, teamId: 1 })).toBeFalsy();

    await actionSelect.selectOption("CHECK_IN");
    await submit(page);

    data = await fetchTournamentLoaderData();
    expect(getTeamCheckedInAt({ data, teamId: 1 })).toBeTruthy();

    // Check out team
    await actionSelect.selectOption("CHECK_OUT");
    await submit(page);

    data = await fetchTournamentLoaderData();
    expect(getTeamCheckedInAt({ data, teamId: 1 })).toBeFalsy();

    // Remove member...
    const firstTeam = data.teams.find((t) => t.id === 1);
    invariant(firstTeam, "First team not found");
    const firstNonOwnerMember = firstTeam.members.find(
      (m) => m.userId !== 1 && !m.isOwner
    );
    invariant(firstNonOwnerMember, "First non owner member not found");

    await actionSelect.selectOption("REMOVE_MEMBER");
    await memberSelect.selectOption(String(firstNonOwnerMember.userId));
    await submit(page);

    data = await fetchTournamentLoaderData();
    const firstTeamAgain = data.teams.find((t) => t.id === 1);
    invariant(firstTeamAgain, "First team again not found");
    expect(firstTeamAgain.members.length).toBe(firstTeam.members.length - 1);

    // ...and add to another team
    const teamWithSpace = data.teams.find(
      (t) => t.id !== 1 && t.members.length === 4
    );
    invariant(teamWithSpace, "Team with space not found");

    await actionSelect.selectOption("ADD_MEMBER");
    await teamSelect.selectOption(String(teamWithSpace.id));
    await selectUser({
      labelName: "User",
      userName: firstNonOwnerMember.discordName,
      page,
    });
    await submit(page);

    data = await fetchTournamentLoaderData();
    const teamWithSpaceAgain = data.teams.find(
      (t) => t.id === teamWithSpace.id
    );
    invariant(teamWithSpaceAgain, "Team with space again not found");

    expect(teamWithSpaceAgain.members.length).toBe(
      teamWithSpace.members.length + 1
    );

    // Remove team
    await actionSelect.selectOption("DELETE_TEAM");
    await teamSelect.selectOption("1");
    await submit(page);

    data = await fetchTournamentLoaderData();
    expect(data.teams.find((t) => t.id === 1)).toBeFalsy();
  });

  test("checks in and appears on the bracket", async ({ page }) => {
    await seed(page);
    await impersonate(page);

    await navigate({
      page,
      url: tournamentBracketsPage(1),
    });

    await isNotVisible(page.getByText("Chimera"));

    await page.getByTestId("register-tab").click();
    await page.getByTestId("check-in-button").click();

    await page.getByTestId("brackets-tab").click();
    await page.getByText("#1 Chimera").waitFor();
  });
});
