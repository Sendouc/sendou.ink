import React from "react";
import { Ability } from "../../types";
import { abilityIcons } from "../../assets/imageImports";

//https://github.com/loadout-ink/splat2-calc

const sizeMap = {
  MAIN: "50px",
  SUB: "40px",
  TINY: "30px",
  SUBTINY: "20px",
} as const;

interface AbilityIconProps {
  ability: Ability | "EMPTY";
  size: "MAIN" | "SUB" | "TINY" | "SUBTINY";
}

const AbilityIcon: React.FC<AbilityIconProps> = ({ ability, size }) => {
  return (
    <img
      src={abilityIcons[ability]}
      style={{
        zIndex: 2,
        borderRadius: "50%",
        width: sizeMap[size],
        height: sizeMap[size],
        background: "#000",
        border: "2px solid #888",
        borderRight: "0px",
        borderBottom: "0px",
        backgroundSize: "100%",
        boxShadow: "0 0 0 1px #000",
        userSelect: "none",
        display: "inline-block",
      }}
      alt={ability}
    />
  );
};

export default AbilityIcon;
