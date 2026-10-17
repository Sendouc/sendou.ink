import type { Page } from "@playwright/test";
import type { Ability, ModeShort } from "~/modules/in-game-lists/types";
import { weaponBuildPage } from "~/utils/urls";
import { expect, navigate } from "../../helpers/playwright";
import { BuildCard } from "./build-card";

export class WeaponBuildsPage {
	private readonly page: Page;
	readonly locators;

	constructor(page: Page) {
		this.page = page;
		this.locators = {
			buildCards: page.getByTestId("build-card"),
			abilityStatsLink: page.getByRole("link", { name: /Ability stats/ }),
			popularBuildsLink: page.getByRole("link", { name: /Popular builds/ }),
			filtersLogInButton: page.getByTestId("filters-log-in-button"),
			dateInput: page.getByTestId("date-input"),
			expandStackButtons: page.getByTestId("expand-build-stack"),
			collapseStackButtons: page.getByTestId("collapse-build-stack"),
		};
	}

	async goto(weaponSlug: string) {
		await navigate({ page: this.page, url: weaponBuildPage(weaponSlug) });
	}

	buildCard(nth: number) {
		return new BuildCard(this.locators.buildCards.nth(nth));
	}

	async expandBuildStacks() {
		const buttons = this.locators.expandStackButtons;
		await expect(this.locators.buildCards.first()).toBeVisible();

		for (let count = await buttons.count(); count > 0; count--) {
			await buttons.first().click();
			await expect(buttons).toHaveCount(count - 1);
		}
	}

	ability(ability: Ability) {
		return this.page.getByTestId(`${ability}-ability`);
	}

	modeBadge(mode: ModeShort) {
		return this.page.getByTestId(`build-mode-${mode}`);
	}

	abilityToggle(abilityName: string) {
		return this.page.getByRole("button", { name: abilityName, exact: true });
	}

	filterOption(name: string) {
		return this.page.getByRole("radio", { name, exact: true });
	}
}
