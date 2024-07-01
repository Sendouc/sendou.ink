import * as React from "react";
import { useTranslation } from "react-i18next";
import { weaponParams } from "~/features/build-analyzer/core/utils";
import { weaponCategories } from "~/modules/in-game-lists";
import { weaponAltNames } from "~/modules/in-game-lists/weapon-alt-names";

const mainWeaponParams = weaponParams().mainWeapons;

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
							subWeaponId: mainWeaponParams[weaponId].subWeaponId,
							specialWeaponId: mainWeaponParams[weaponId].specialWeaponId,
							altNames: normalizeToArray(weaponAltNames.get(weaponId)),
							label: t(`weapons:MAIN_${weaponId}`),
						};
					}),
				};
			}),
		[t],
	);

	return options;
}

const normalizeToArray = (val: string | string[] | undefined) => {
	if (val === undefined) return [];
	return Array.isArray(val) ? val : [val];
};
