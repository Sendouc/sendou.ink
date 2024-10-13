import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dbInsertUsers, dbReset, wrappedAction } from "~/utils/Test";
import { action as teamIndexPageAction } from "../actions/t.server";
import { action as _editTeamAction } from "../routes/t.$customUrl.edit";
import type { createTeamSchema, editTeamSchema } from "../team-schemas.server";

const createTeamAction = wrappedAction<typeof createTeamSchema>({
	action: teamIndexPageAction,
});

const editTeamAction = wrappedAction<typeof editTeamSchema>({
	action: _editTeamAction,
});

describe("team creation", () => {
	beforeEach(async () => {
		await dbInsertUsers();
	});
	afterEach(() => {
		dbReset();
	});

	it("can't take another team's name via editing", async () => {
		await createTeamAction({ name: "Team 1" }, { user: "regular" });
		await createTeamAction({ name: "Team 2" }, { user: "regular" });

		const res = await editTeamAction(
			{
				_action: "EDIT",
				name: "Team 2",
				bio: null,
				bsky: null,
				css: null,
				twitter: null,
			},
			{ user: "regular", params: { customUrl: "team-1" } },
		);

		expect(res.errors[0]).toBe("forms.errors.duplicateName");
	});

	it("prevents editing team name to only special characters", async () => {
		await createTeamAction({ name: "Team 1" }, { user: "regular" });

		expect(
			editTeamAction(
				{
					_action: "EDIT",
					name: "𝓢𝓲𝓵",
					bio: null,
					bsky: null,
					css: null,
					twitter: null,
				},
				{ user: "regular", params: { customUrl: "team-1" } },
			),
		).rejects.toThrow("status code: 400");
	});
});
