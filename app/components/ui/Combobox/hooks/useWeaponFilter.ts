import * as React from "react";
import { useTranslation } from "react-i18next";
import {
	specialWeaponIds,
	subWeaponIds,
	weaponCategories,
} from "~/modules/in-game-lists";
import type { useWeaponOptions } from "./useWeaponOptions";

export function useWeaponFilter(
	categories: ReturnType<typeof useWeaponOptions>,
	value: string,
) {
	const normalizedValue = value.trim().toLowerCase();

	const {
		subWeaponId,
		specialWeaponId,
		category: categoryIdentifier,
	} = useValueAsIdentifier(normalizedValue);

	const filtered = React.useMemo(() => {
		if (!normalizedValue) return categories;

		return categories.flatMap((category) => {
			const options = category.options.filter((option) => {
				if (typeof subWeaponId === "number") {
					return option.subWeaponId === subWeaponId;
				}
				if (typeof specialWeaponId === "number") {
					return option.specialWeaponId === specialWeaponId;
				}
				if (typeof categoryIdentifier === "string") {
					return category.id === categoryIdentifier;
				}

				if (option.altNames.includes(normalizedValue)) {
					return true;
				}

				return option.label.toLowerCase().includes(normalizedValue);
			});

			if (options.length === 0) {
				return [];
			}

			return {
				...category,
				options,
			};
		});
	}, [
		categories,
		normalizedValue,
		subWeaponId,
		specialWeaponId,
		categoryIdentifier,
	]);

	return filtered;
}

function useValueAsIdentifier(value: string) {
	const { t } = useTranslation(["weapons"]);

	for (const subWeaponId of subWeaponIds) {
		const translated = t(`weapons:SUB_${subWeaponId}`);

		if (value === translated.toLowerCase()) {
			return { subWeaponId, specialWeaponId: null, category: null };
		}
	}

	for (const specialWeaponId of specialWeaponIds) {
		const translated = t(`weapons:SPECIAL_${specialWeaponId}`);

		if (value === translated.toLowerCase()) {
			return { subWeaponId: null, specialWeaponId, category: null };
		}
	}

	for (const category of weaponCategories) {
		const translated = t(`common:weapon.category.${category.name}`);

		if (value === translated.toLowerCase()) {
			return {
				subWeaponId: null,
				specialWeaponId: null,
				category: category.name,
			};
		}
	}

	return { subWeaponId: null, specialWeaponId: null, category: null };
}
