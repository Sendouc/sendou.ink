import * as React from "react";
import { useTranslation } from "react-i18next";
import { weaponCategories } from "~/modules/in-game-lists";

export function useWeaponOptions() {
	const { t } = useTranslation(["common", "weapons"]);

	const options = React.useMemo(
		() =>
			weaponCategories.map((category) => {
				return {
					id: category.name,
					label: t(`common:weapon.category.${category.name}`),
					options: category.weaponIds.map((weaponId) => {
						return {
							id: weaponId,
							label: t(`weapons:MAIN_${weaponId}`),
						};
					}),
				};
			}),
		[t],
	);

	return options;
}
