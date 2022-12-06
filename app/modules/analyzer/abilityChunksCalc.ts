import { abilities } from "../in-game-lists";
import type {
  AbilityWithUnknown,
  BuildAbilitiesTupleWithUnknown,
} from "../in-game-lists/types";
import type { AbilityChunks } from "./types";

// Reference for Ability Chunks numbers: https://splatoonwiki.org/wiki/Ability_chunk#Splatoon_3
const MAIN_REQUIRED_ABILITY_CHUNKS_COUNT = 45;
const PRIMARY_SLOT_ONLY_REQUIRED_ABILITY_CHUNKS_COUNT = 15;
const SUB_REQUIRED_ABILITY_CHUNKS_COUNT = 10;

export const ABILITIES_WITHOUT_CHUNKS = new Set(["UNKNOWN", "AD"]);

// From a given build, create a map of <Ability, number>, then return it as an Array after sorting by value, descending.
//    The data structure describes the number of Ability chunks required for any given build.
export function getAbilityChunksMapAsArray(
  build: BuildAbilitiesTupleWithUnknown
) {
  const abilityChunksMap: AbilityChunks = new Map<AbilityWithUnknown, number>();
  updateAbilityChunksMap(abilityChunksMap, build);

  // Sort by value (number, descending) first, then sort by name (string, ascending)
  return Array.from(abilityChunksMap).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
}

function updateAbilityChunksMap(
  abilityChunksMap: AbilityChunks,
  build: BuildAbilitiesTupleWithUnknown
) {
  for (const gear of build) {
    // Handles the incremental amount of ability chunks required for the same ability for 1 piece of gear
    const abilityChunksMapForGear = new Map<AbilityWithUnknown, number>();

    for (const [index, selectedAbility] of gear.entries()) {
      if (!selectedAbility) continue;
      if (ABILITIES_WITHOUT_CHUNKS.has(selectedAbility)) continue;

      // Ability is in main slot
      if (index === 0) {
        const primarySlotOnlyAbilityRef = abilities.filter(
          (a) =>
            a.name === selectedAbility && a.abilityChunkTypesRequired.length > 0
        );

        // Extra processing is required for Main abilities that are primary slot-only abilities,
        //    as they are comprised of 3 stackable ability chunks at a lower ability chunk count than usual.
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
              MAIN_REQUIRED_ABILITY_CHUNKS_COUNT
          );
        }
      }

      // Ability is in a sub slot
      else {
        // 1 Ability in sub slot = 10 chunks, 2 abilities = 20 chunks, 3 abilities = 30 chunks
        abilityChunksMapForGear.set(
          selectedAbility,
          (abilityChunksMapForGear.get(selectedAbility) ?? 0) +
            SUB_REQUIRED_ABILITY_CHUNKS_COUNT
        );

        abilityChunksMap.set(
          selectedAbility,
          (abilityChunksMap.get(selectedAbility) ?? 0) +
            (abilityChunksMapForGear.get(selectedAbility) ?? 0)
        );
      }
    }
  }
}
