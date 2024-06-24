import type { Page } from "@playwright/test";
import { impersonate, navigate, seed } from "~/utils/playwright";
import { tournamentBracketsPage } from "~/utils/urls";

export const startBracket = async (page: Page, tournamentId = 2) => {
	await seed(page);
	await impersonate(page);

	await navigate({
		page,
		url: tournamentBracketsPage({ tournamentId }),
	});

	await page.getByTestId("finalize-bracket-button").click();
	await page.getByTestId("confirm-finalize-bracket-button").click();
};
