import invariant from "tiny-invariant";
import { abilities } from "~/modules/in-game-lists";
import type { BuildAbilitiesTupleWithUnknown } from "~/modules/in-game-lists/types";
import { abilityImageUrl } from "~/utils/urls";
import { Ability } from "./Ability";
import { Image } from "./Image";

interface AbilitiesSelectorProps {
  selectedAbilities: BuildAbilitiesTupleWithUnknown;
  onChange: (newAbilities: BuildAbilitiesTupleWithUnknown) => void;
}

export function AbilitiesSelector({
  selectedAbilities,
  onChange,
}: AbilitiesSelectorProps) {
  const onSlotClick = ({
    rowI,
    abilityI,
  }: {
    rowI: number;
    abilityI: number;
  }) => {
    const abilitiesClone = JSON.parse(
      JSON.stringify(selectedAbilities)
    ) as BuildAbilitiesTupleWithUnknown;

    const row = abilitiesClone[rowI];
    invariant(row);
    invariant(row.length === 4);

    // no need to trigger a rerender
    if (row[abilityI] === "UNKNOWN") return;

    row[abilityI] = "UNKNOWN";

    onChange(abilitiesClone);
  };
  const onButtonClick = (ability: typeof abilities[number]) => {
    onChange(addAbility({ oldAbilites: selectedAbilities, ability }));
  };

  return (
    <div className="ability-selector__container">
      <div className="ability-selector__slots">
        {selectedAbilities.map((row, rowI) =>
          row.map((ability, abilityI) => (
            <Ability
              key={abilityI}
              ability={ability}
              size={abilityI === 0 ? "MAIN" : "SUB"}
              onClick={() => onSlotClick({ rowI, abilityI })}
            />
          ))
        )}
      </div>
      <div className="ability-selector__ability-buttons">
        {abilities.map((ability) => (
          <button
            key={ability.name}
            className="ability-selector__ability-button"
            type="button"
            onClick={() => onButtonClick(ability)}
            data-cy={`${ability.name}-ability-button`}
          >
            <Image
              alt=""
              path={abilityImageUrl(ability.name)}
              width={32}
              height={32}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function addAbility({
  oldAbilites,
  ability,
}: {
  oldAbilites: BuildAbilitiesTupleWithUnknown;
  ability: typeof abilities[number];
}): BuildAbilitiesTupleWithUnknown {
  const abilitiesClone = JSON.parse(
    JSON.stringify(oldAbilites)
  ) as BuildAbilitiesTupleWithUnknown;

  for (const [i, row] of abilitiesClone.entries()) {
    const legalGearTypeForMain =
      i === 0
        ? "HEAD_MAIN_ONLY"
        : i === 1
        ? "CLOTHES_MAIN_ONLY"
        : "SHOES_MAIN_ONLY";

    for (const [j, oldAbility] of row.entries()) {
      const isMainSlot = j === 0;

      // slot is not empty
      if (oldAbility !== "UNKNOWN") continue;

      // can't put this type of gear in main slot
      if (
        !["STACKABLE", legalGearTypeForMain].includes(ability.type) &&
        isMainSlot
      ) {
        continue;
      }

      // can't put main slot only gear to sub slots
      if (!isMainSlot && ability.type !== "STACKABLE") continue;

      abilitiesClone[i]![j] = ability.name;

      return abilitiesClone;
    }
  }

  // no-op if no available slots
  return abilitiesClone;
}
