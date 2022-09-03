import type { AllAbilitiesTuple } from "~/db/models/builds/queries.server";
import { Ability } from "./Ability";

interface AbilitiesSelectorProps {
  abilities: AllAbilitiesTuple;
  onChange: (newAbilities: AllAbilitiesTuple) => void;
}

export function AbilitiesSelector({
  abilities,
  onChange,
}: AbilitiesSelectorProps) {
  return (
    <div className="ability-selector__container">
      <div className="ability-selector__ability-row">
        {abilities.map((row) =>
          row.map((ability, i) => (
            <Ability
              key={i}
              ability={ability}
              size={i === 0 ? "MAIN" : "SUB"}
            />
          ))
        )}
      </div>
    </div>
  );
}
