import * as React from "react";
import { useTranslation } from "react-i18next";
import type { GearType } from "~/db/types";
import {
	clothesGear,
	headGear,
	shoesGear,
} from "~/modules/in-game-lists/gear-ids";
import type { BrandId } from "~/modules/in-game-lists/types";

export function useGearOptions(slot: GearType) {
	const { t } = useTranslation(["game-misc", "gear"]);

	const gear =
		slot === "HEAD" ? headGear : slot === "CLOTHES" ? clothesGear : shoesGear;

	const gearIdToTranslated = React.useCallback(
		(gearId: number) => {
			const prefix = slot === "HEAD" ? "H" : slot === "CLOTHES" ? "C" : "S";

			return t(`gear:${prefix}_${gearId}`);
		},
		[t, slot],
	);

	const options = React.useMemo(
		() =>
			Object.entries(gear)
				.map(([brandId, gearIds]) => {
					return {
						id: brandId as BrandId,
						label: t(`game-misc:BRAND_${brandId}`),
						options: gearIds.map((gearId) => ({
							id: gearId,
							label: gearIdToTranslated(gearId),
						})),
					};
				})
				.filter(({ options }) => options.length > 0),
		[t, gearIdToTranslated, gear],
	);

	return options;
}
