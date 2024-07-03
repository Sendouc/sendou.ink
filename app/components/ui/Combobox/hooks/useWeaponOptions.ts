import * as React from "react";
import { useTranslation } from "react-i18next";
import { weaponParams } from "~/features/build-analyzer/core/utils";
import { type MainWeaponId, weaponCategories } from "~/modules/in-game-lists";
import { weaponAltNames } from "~/modules/in-game-lists/weapon-alt-names";

const mainWeaponParams = weaponParams().mainWeapons;

export function useWeaponOptions(quickSelectWeaponIds?: MainWeaponId[]) {
	const { t } = useTranslation(["common", "weapons"]);

	const weaponIdToComboBoxOption = React.useCallback(
		(weaponId: MainWeaponId) => ({
			id: weaponId,
			subWeaponId: mainWeaponParams[weaponId].subWeaponId,
			specialWeaponId: mainWeaponParams[weaponId].specialWeaponId,
			altNames: normalizeToArray(weaponAltNames.get(weaponId)),
			label: t(`weapons:MAIN_${weaponId}`),
		}),
		[t],
	);

	const options = React.useMemo(() => {
		const result = weaponCategories.map((category) => {
			return {
				id: category.name as typeof category.name | "QUICK",
				label: t(`common:weapon.category.${category.name}`),
				options: category.weaponIds
					.filter(
						(weaponId) =>
							!quickSelectWeaponIds || !quickSelectWeaponIds.includes(weaponId),
					)
					.map(weaponIdToComboBoxOption),
			};
		});

		if (quickSelectWeaponIds) {
			result.unshift({
				id: "QUICK",
				label: t("common:weapon.combobox.recent"),
				options: quickSelectWeaponIds.map(weaponIdToComboBoxOption),
			});
		}

		return result;
	}, [t, quickSelectWeaponIds, weaponIdToComboBoxOption]);

	return options;
}

const normalizeToArray = (val: string | string[] | undefined) => {
	if (val === undefined) return [];
	return Array.isArray(val) ? val : [val];
};
