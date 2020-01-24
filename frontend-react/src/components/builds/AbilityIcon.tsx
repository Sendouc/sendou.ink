import React from "react"
import {
  StackableAbility,
  HeadOnlyAbility,
  ClothingOnlyAbility,
  ShoesOnlyAbility,
} from "../../types"
import { abilityIcons } from "../../assets/imageImports"

const mainAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: 2,
  borderRadius: "50%",
  width: "50px",
  height: "50px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000",
  userSelect: "none",
} as const
const subAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: 2,
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000",
  userSelect: "none",
} as const

interface AbilityIconProps {
  ability:
    | StackableAbility
    | HeadOnlyAbility
    | ClothingOnlyAbility
    | ShoesOnlyAbility
    | "EMPTY"
  size: "MAIN" | "SUB"
}

const AbilityIcon: React.FC<AbilityIconProps> = ({ ability, size }) => {
  return (
    <img
      src={abilityIcons[ability]}
      style={size === "MAIN" ? mainAbilityStyle : subAbilityStyle}
      alt={ability}
    />
  )
}

export default AbilityIcon
