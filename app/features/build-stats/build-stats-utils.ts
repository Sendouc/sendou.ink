import invariant from "tiny-invariant";
import { MAX_AP } from "~/constants";
import { abilities, type Ability } from "~/modules/in-game-lists";
import { roundToNDecimalPlaces } from "~/utils/number";
import type { AverageAbilityPointsResult } from "./queries/averageAbilityPoints.server";

const toBuildsCount = (counts: AverageAbilityPointsResult[]) =>
  counts.reduce((acc, cur) => acc + cur.abilityPointsSum, 0) / MAX_AP;

const toAbilityPoints = (
  abilities: AverageAbilityPointsResult[],
  ability: Ability
) =>
  abilities.find((current) => current.ability === ability)?.abilityPointsSum ??
  0;

export function abilityPointCountsToAverages({
  allAbilities,
  weaponAbilities,
}: {
  allAbilities: AverageAbilityPointsResult[];
  weaponAbilities: AverageAbilityPointsResult[];
}) {
  const allBuildsCount = toBuildsCount(allAbilities);
  const weaponBuildsCount = toBuildsCount(weaponAbilities);
  invariant(
    allBuildsCount > weaponBuildsCount,
    "allBuildsCount < weaponBuildsCount"
  );

  const mainOnlyAbilities = abilities
    .filter((ability) => ability.type !== "STACKABLE")
    .map((ability) => {
      const allBuildsAbilityPoints = toAbilityPoints(
        allAbilities,
        ability.name
      );
      const weaponBuildsAbilityPoints = toAbilityPoints(
        weaponAbilities,
        ability.name
      );

      // main only abilities always take place of 10AP
      const allBuildsWithTheAbility = allBuildsAbilityPoints / 10;
      const weaponBuildsWithTheAbility = weaponBuildsAbilityPoints / 10;

      return {
        name: ability.name,
        percentage: {
          all: roundToNDecimalPlaces(
            (allBuildsWithTheAbility / allBuildsCount) * 100
          ),
          weapon: roundToNDecimalPlaces(
            (weaponBuildsWithTheAbility / weaponBuildsCount) * 100
          ),
        },
      };
    });

  const stackableAbilities = abilities
    .filter((ability) => ability.type === "STACKABLE")
    .map((ability) => {
      const allBuildsAbilityPoints = toAbilityPoints(
        allAbilities,
        ability.name
      );
      const weaponBuildsAbilityPoints = toAbilityPoints(
        weaponAbilities,
        ability.name
      );

      return {
        name: ability.name,
        apAverage: {
          all: roundToNDecimalPlaces(allBuildsAbilityPoints / allBuildsCount),
          weapon: roundToNDecimalPlaces(
            weaponBuildsAbilityPoints / weaponBuildsCount
          ),
        },
      };
    });

  return {
    mainOnlyAbilities,
    stackableAbilities,
    weaponBuildsCount,
  };
}
