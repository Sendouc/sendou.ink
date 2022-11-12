// From an array of Main abilities, create a map of <Ability, number>, then return it as an Array after sorting by value, descending.
//    The map describes the number of Ability chunks required to replace the main ability on a piece of gear.
// Extra processing is required for Main abilities that are primary slot-only abilities,
//    as they are comprised of 3 stackable ability chunks at a lower ability chunk count than usual.

import { abilities } from "../in-game-lists";
import {
  PRIMARY_SLOT_ONLY_REQUIRED_ABILITY_CHUNKS_COUNT,
  REQUIRED_ABILITY_CHUNKS_COUNT,
} from "../in-game-lists/abilities";
import type {
  AbilityWithUnknown,
  BuildAbilitiesTupleWithUnknown,
} from "../in-game-lists/types";
import type { AbilityChunks } from "./types";

export function getAbilityChunksMapAsArray(
  build: BuildAbilitiesTupleWithUnknown
) {
  const abilityChunksMap: AbilityChunks = new Map<AbilityWithUnknown, number>();

  const mainAbilities = build.map((a) => a[0]);

  for (let i = 0; i < mainAbilities.length; i++) {
    const mainAbility = mainAbilities[i];
    console.warn(mainAbility);

    if (typeof mainAbility !== "undefined" && mainAbility !== "UNKNOWN") {
      const primarySlotOnlyAbilityRef = abilities.filter(
        (a) => a.name === mainAbility && a.abilityChunkTypesRequired.length > 0
      );

      // Primary-slot-only item that can have ability chunks put on it
      if (primarySlotOnlyAbilityRef.length === 1) {
        const primaryAbility = primarySlotOnlyAbilityRef[0];
        if (!primaryAbility) continue;

        for (const ability of primaryAbility.abilityChunkTypesRequired) {
          if (!ability) continue;

          abilityChunksMap.set(
            ability,
            (abilityChunksMap.get(ability) ?? 0) +
              PRIMARY_SLOT_ONLY_REQUIRED_ABILITY_CHUNKS_COUNT
          );
        }
      } else {
        abilityChunksMap.set(
          mainAbility,
          (abilityChunksMap.get(mainAbility) ?? 0) +
            REQUIRED_ABILITY_CHUNKS_COUNT
        );
      }
    }
  }

  return Array.from(abilityChunksMap).sort((a, b) => b[1] - a[1]);
}
