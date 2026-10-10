import type { Page } from "@playwright/test";
import { tournamentAdminPage } from "~/utils/urls";
import { navigate, submit } from "../../helpers/playwright";

/** `/to/:id/admin/stream` — the cast accounts form. */
export class TournamentAdminStreamPage {
	private readonly page: Page;
	readonly locators;

	constructor(page: Page) {
		this.page = page;
		this.locators = {
			accountInputs: page.getByPlaceholder("dappleproductions"),
			addAccountButton: page.getByRole("button", { name: "Add", exact: true }),
		};
	}

	async goto(tournamentId: number) {
		await navigate({
			page: this.page,
			url: `${tournamentAdminPage(tournamentId)}/stream`,
		});
	}

	accountInput(nth: number) {
		return this.locators.accountInputs.nth(nth);
	}

	/** An empty array field already renders one placeholder input to fill. */
	async fillAccount(nth: number, account: string) {
		await this.accountInput(nth).fill(account);
	}

	async addAccountField() {
		await this.locators.addAccountButton.click();
	}

	save() {
		return submit(this.page, "save-cast-accounts-button");
	}
}
