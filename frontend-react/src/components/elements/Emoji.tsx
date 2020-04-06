import React from "react"
import WeaponImage from "../common/WeaponImage"
import { weaponCodes, abilityCodes, gearCodes } from "../../utils/lists"
import AbilityIcon from "../builds/AbilityIcon"
import GearImage from "../builds/GearImage"

interface EmojiProps {
  value: string
}

const Emoji: React.FC<EmojiProps> = (props) => {
  const value = props.value.replace(/:/g, "").toLowerCase()

  const weaponName = weaponCodes[value]
  if (!!weaponName)
    return <WeaponImage englishName={weaponName as any} size="SMALL" />

  const abilityName = abilityCodes[value]
  if (!!abilityName) return <AbilityIcon size="TINY" ability={abilityName} />

  const gearName = gearCodes[value]
  if (!!gearName) return <GearImage englishName={gearName} mini />

  return <>{props.value}</>
}

export default Emoji
