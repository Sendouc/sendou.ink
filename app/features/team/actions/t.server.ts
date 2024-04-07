import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/features/auth/core/user.server";
import { parseRequestFormData, validate } from "~/utils/remix";
import { mySlugify, teamPage } from "~/utils/urls";
import { allTeams } from "../queries/allTeams.server";
import { createNewTeam } from "../queries/createNewTeam.server";
import { createTeamSchema } from "../team-schemas.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: createTeamSchema,
  });

  const teams = allTeams();

  validate(
    teams.every((team) =>
      team.members.every((member) => member.id !== user.id),
    ),
    "Already in a team",
  );

  // two teams can't have same customUrl
  const customUrl = mySlugify(data.name);

  validate(customUrl.length > 0, "Team name can't be only special characters");

  if (teams.some((team) => team.customUrl === customUrl)) {
    return {
      errors: ["forms.errors.duplicateName"],
    };
  }

  createNewTeam({
    captainId: user.id,
    name: data.name,
    customUrl,
  });

  throw redirect(teamPage(customUrl));
};
