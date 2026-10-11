import type { Page } from "@playwright/test";
import { tournamentStreamsPage } from "~/utils/urls";
import { navigate } from "../../helpers/playwright";

/** `/to/:id/streams` */
export class TournamentStreamsPage {
	private readonly page: Page;
	readonly locators;

	constructor(page: Page) {
		this.page = page;
		this.locators = {
			streams: page.getByTestId("tournament-stream"),
			helpButton: page.getByRole("button", { name: "Stream not showing up?" }),
			helpDialog: page.getByRole("dialog", {
				name: "Getting your stream shown",
			}),
		};
	}

	async goto(tournamentId: number) {
		await navigate({
			page: this.page,
			url: tournamentStreamsPage(tournamentId),
		});
	}

	platformLink(platformName: "Twitch" | "YouTube") {
		return this.page.getByRole("link", { name: platformName, exact: true });
	}

	viewerCount(count: number) {
		return this.page.getByText(String(count), { exact: true });
	}
}
