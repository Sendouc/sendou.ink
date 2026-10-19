import { cachified } from "@epic-web/cachified";
import type { LoaderFunctionArgs } from "react-router";
import * as BuildRepository from "~/features/builds/BuildRepository.server";
import { cachedPublicBuildCounts } from "~/features/builds/core/public-build-counts.server";
import { getServerTFunction } from "~/modules/i18n/i18next.server";
import {
	weaponCategories,
	weaponIdToCategory,
	weaponIdToType,
} from "~/modules/in-game-lists/weapon-ids";
import { cache } from "~/utils/cache.server";
import { invariant } from "~/utils/invariant";
import { notFound, notFoundIfNullish } from "~/utils/remix.server";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import { ANY_TIME } from "../build-stats-constants";
import { buildStatsSearchParams } from "../build-stats-search-params";
import { abilityStats } from "../build-stats-utils";

export const loader = async ({ params, url }: LoaderFunctionArgs) => {
	const t = getServerTFunction(["weapons"]);
	const weaponId = notFoundIfNullish(weaponNameSlugToId(params.slug));

	if (weaponIdToType(weaponId) === "ALT_SKIN") {
		notFound();
	}

	const category = weaponIdToCategory(weaponId);
	const { date } = buildStatsSearchParams.parse(url);
	const updatedSince = date === ANY_TIME ? null : date;

	const allAbilityPointSums = await cachified({
		key: `all-ability-point-sums-${date}`,
		cache,
		getFreshValue: () => BuildRepository.findAllAbilityPointSums(updatedSince),
	});

	const weaponAbilityPointCounts = await cachified({
		key: `ability-point-counts-${category}-${date}`,
		cache,
		getFreshValue: () => {
			const categoryWeaponIds = weaponCategories.find(
				(weaponCategory) => weaponCategory.name === category,
			)?.weaponIds;
			invariant(categoryWeaponIds, `No weapons for category ${category}`);

			return BuildRepository.findAbilityPointCountsByWeaponIds({
				weaponIds: [...categoryWeaponIds],
				updatedSince,
			});
		},
	});

	return {
		stats: abilityStats({
			weaponId,
			allAbilityPointSums,
			weaponAbilityPointCounts,
		}),
		weaponId,
		weaponName: t(`weapons:MAIN_${weaponId}`),
		weaponCategory: category,
		slug: params.slug!,
		buildsCount: (await cachedPublicBuildCounts()).get(weaponId) ?? 0,
	};
};
