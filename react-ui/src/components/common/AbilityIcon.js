import React from "react"
import { abilityIcons } from "../../assets/imageImports"

const mainAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: "2",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000",
  userSelect: "none"
}
const subAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: "2",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000",
  userSelect: "none"
}

const AbilityIcon = ({
  ability,
  size = "MAIN",
  style = {},
  onClick = null
}) => {
  if (ability == null) return null
  return (
    <span style={style} onClick={onClick}>
      <img
        src={abilityIcons[ability]}
        style={size === "MAIN" ? mainAbilityStyle : subAbilityStyle}
        alt={ability}
      />
    </span>
  )
}

export default AbilityIcon
