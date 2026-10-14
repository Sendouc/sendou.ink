import { abilities } from "~/modules/in-game-lists/abilities";
import type { Ability } from "~/modules/in-game-lists/types";
import { invariant } from "~/utils/invariant";
import { roundToNDecimalPlaces } from "~/utils/number";
import { isStackableAbility } from "../build-analyzer/core/ability-points";
import type {
	AverageAbilityPointsResult,
	PopularBuildsRow,
} from "../builds/BuildRepository.server";

const toAbilityPoints = (
	results: AverageAbilityPointsResult,
	ability: Ability,
) =>
	results.abilities.find((current) => current.ability === ability)
		?.abilityPointsSum ?? 0;

export function abilityPointCountsToAverages({
	allAbilities,
	weaponAbilities,
}: {
	allAbilities: AverageAbilityPointsResult;
	weaponAbilities: AverageAbilityPointsResult;
}) {
	const allBuildsCount = allAbilities.buildsCount;
	const weaponBuildsCount = weaponAbilities.buildsCount;
	invariant(
		allBuildsCount > weaponBuildsCount,
		"allBuildsCount < weaponBuildsCount",
	);

	const mainOnlyAbilities = abilities
		.filter((ability) => ability.type !== "STACKABLE")
		.map((ability) => {
			const allBuildsAbilityPoints = toAbilityPoints(
				allAbilities,
				ability.name,
			);
			const weaponBuildsAbilityPoints = toAbilityPoints(
				weaponAbilities,
				ability.name,
			);

			// main only abilities always take place of 10AP
			const allBuildsWithTheAbility = allBuildsAbilityPoints / 10;
			const weaponBuildsWithTheAbility = weaponBuildsAbilityPoints / 10;

			return {
				name: ability.name,
				percentage: {
					all: roundToNDecimalPlaces(
						(allBuildsWithTheAbility / allBuildsCount) * 100,
					),
					weapon: roundToNDecimalPlaces(
						(weaponBuildsWithTheAbility / weaponBuildsCount) * 100,
					),
				},
			};
		})
		.sort((a, b) => b.percentage.weapon - a.percentage.weapon);

	const stackableAbilities = abilities
		.filter((ability) => ability.type === "STACKABLE")
		.map((ability) => {
			const allBuildsAbilityPoints = toAbilityPoints(
				allAbilities,
				ability.name,
			);
			const weaponBuildsAbilityPoints = toAbilityPoints(
				weaponAbilities,
				ability.name,
			);

			return {
				name: ability.name,
				apAverage: {
					all: roundToNDecimalPlaces(allBuildsAbilityPoints / allBuildsCount),
					weapon: roundToNDecimalPlaces(
						weaponBuildsAbilityPoints / weaponBuildsCount,
					),
				},
			};
		})
		.sort((a, b) => b.apAverage.weapon - a.apAverage.weapon);

	return {
		mainOnlyAbilities,
		stackableAbilities,
		weaponBuildsCount,
	};
}

export function popularBuilds(rows: Array<PopularBuildsRow>) {
	let previousCount: number;
	return rows.map(({ abilitiesSignature, count }) => {
		const parsedAbilities = abilitiesSignature
			.split(",")
			.map((serializedAbility) => {
				const [ability, points] = serializedAbility.split("_");
				invariant(ability, "ability is not defined");
				invariant(points, "count is not defined");
				return {
					ability: ability as Ability,
					count: isStackableAbility(ability as Ability)
						? Number(points)
						: undefined,
				};
			});

		const displayCount = previousCount === count ? null : count;
		previousCount = count;
		return {
			abilities: parsedAbilities,
			count: displayCount,
			id: abilitiesSignature,
		};
	});
}
