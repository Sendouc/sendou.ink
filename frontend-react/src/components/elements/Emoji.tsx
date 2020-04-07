import React from "react"
import WeaponImage from "../common/WeaponImage"
import { weaponCodes, abilityCodes, gearCodes } from "../../utils/lists"
import AbilityIcon from "../builds/AbilityIcon"
import GearImage from "../builds/GearImage"
import sz from "../../assets/sz.png"
import tc from "../../assets/tc.png"
import rm from "../../assets/rm.png"
import cb from "../../assets/cb.png"
import { Image } from "@chakra-ui/core"

const modeCodes: Record<string, string> = {
  sz,
  tc,
  rm,
  cb,
} as const

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

  const mode = modeCodes[value]
  if (!!mode)
    return <Image src={mode} display="inline-block" w="32px" h="32px" />

  return <>{props.value}</>
}

export default Emoji
