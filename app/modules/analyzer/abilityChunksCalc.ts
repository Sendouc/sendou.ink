// From an array of Main abilities, create a map of <Ability, number>, then return it as an Array after sorting by value, descending.
//    The map describes the number of Ability chunks required to replace the main ability on a piece of gear.
// Extra processing is required for Main abilities that are primary slot-only abilities,
//    as they are comprised of 3 stackable ability chunks at a lower ability chunk count than usual.

import type { abilitiesShort } from "../in-game-lists";
import { abilities } from "../in-game-lists";
import {
  PRIMARY_SLOT_ONLY_REQUIRED_ABILITY_CHUNKS_COUNT,
  REQUIRED_ABILITY_CHUNKS_COUNT,
  SUB_REQUIRED_ABILITY_CHUNKS_COUNT,
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

  const mainAbilities = build.flatMap((a) => {
    if (a[0] === "UNKNOWN") return [];
    return a[0];
  });

  const subAbilities = build.flatMap((a) =>
    a.flatMap((b, i) => {
      if (i === 0) return []; // Exclude first slot as this is a Main Ability
      if (b === "UNKNOWN") return [];
      return b;
    })
  );

  updateAbilityChunksMap(abilityChunksMap, mainAbilities, true);
  updateAbilityChunksMap(abilityChunksMap, subAbilities, false);

  // Sort by value (number, descending) first, then sort by name (string, ascending)
  return Array.from(abilityChunksMap).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
}

function updateAbilityChunksMap(
  abilityChunksMap: AbilityChunks,
  abilityList: typeof abilitiesShort,
  isInMainAbilitySlot: boolean
) {
  for (const selectedAbility of abilityList) {
    if (!selectedAbility) continue;

    if (isInMainAbilitySlot) {
      const primarySlotOnlyAbilityRef = abilities.filter(
        (a) =>
          a.name === selectedAbility && a.abilityChunkTypesRequired.length > 0
      );

      // Primary-slot-only item that can have ability chunks put on it
      if (primarySlotOnlyAbilityRef.length === 1) {
        const primaryAbility = primarySlotOnlyAbilityRef[0];
        if (!primaryAbility) continue;

        for (const ability of primaryAbility.abilityChunkTypesRequired) {
          abilityChunksMap.set(
            ability,
            (abilityChunksMap.get(ability) ?? 0) +
              PRIMARY_SLOT_ONLY_REQUIRED_ABILITY_CHUNKS_COUNT
          );
        }
      } else {
        abilityChunksMap.set(
          selectedAbility,
          (abilityChunksMap.get(selectedAbility) ?? 0) +
            REQUIRED_ABILITY_CHUNKS_COUNT
        );
      }
    }

    // Ability is in a sub slot
    else {
      abilityChunksMap.set(
        selectedAbility,
        (abilityChunksMap.get(selectedAbility) ?? 0) +
          SUB_REQUIRED_ABILITY_CHUNKS_COUNT
      );
    }
  }
}
