import * as React from "react";
import { useTranslation } from "react-i18next";
import { brandIds } from "~/modules/in-game-lists/brands-ids";
import type { useGearOptions } from "./useGearOptions";

export function useGearFilter(
	categories: ReturnType<typeof useGearOptions>,
	value: string,
) {
	const normalizedValue = value.trim().toLowerCase();

	const brandId = useValueAsIdentifier(normalizedValue);

	const filtered = React.useMemo(() => {
		if (!normalizedValue) return categories;

		return categories.flatMap((category) => {
			const options = category.options.filter((option) => {
				if (typeof brandId === "string") {
					return category.id === brandId;
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
	}, [categories, normalizedValue, brandId]);

	return filtered;
}

function useValueAsIdentifier(value: string) {
	const { t } = useTranslation(["game-misc"]);

	for (const brandId of brandIds) {
		const translated = t(`game-misc:BRAND_${brandId}`);

		if (value === translated.toLowerCase()) {
			return brandId;
		}
	}

	return null;
}
