import type { BuildAbilitiesTuple } from "~/modules/in-game-lists";
import type { BuildFiltersFromSearchParams } from "../builds-schemas.server";
import { buildToAbilityPoints } from "~/features/build-analyzer";
import type { AbilityBuildFilter } from "../builds-types";

export function filterBuilds<T extends { abilities: BuildAbilitiesTuple }>({
  filters,
  count,
  builds,
}: {
  filters: BuildFiltersFromSearchParams;
  count: number;
  builds: T[];
}) {
  const result: T[] = [];

  for (const build of builds) {
    if (result.length === count) break;

    if (buildMatchesFilters({ build, filters })) {
      result.push(build);
    }
  }

  return result;
}

function buildMatchesFilters<T extends { abilities: BuildAbilitiesTuple }>({
  build,
  filters,
}: {
  build: T;
  filters: BuildFiltersFromSearchParams;
}) {
  for (const filter of filters) {
    if (filter.type === "ability") {
      if (!matchesAbilityFilter({ build, filter })) return false;
    }
  }

  return true;
}

function matchesAbilityFilter({
  build,
  filter,
}: {
  build: { abilities: BuildAbilitiesTuple };
  filter: Omit<AbilityBuildFilter, "id">;
}) {
  if (typeof filter.value === "boolean") {
    const hasAbility = build.abilities.flat().includes(filter.ability);
    if (filter.value && !hasAbility) return false;
    if (!filter.value && hasAbility) return false;
  } else if (filter.value) {
    const abilityPoints = buildToAbilityPoints(build.abilities);
    const ap = abilityPoints.get(filter.ability) ?? 0;
    if (filter.comparison === "AT_LEAST" && ap < filter.value) return false;
    if (filter.comparison === "AT_MOST" && ap > filter.value) return false;
  }

  return true;
}
