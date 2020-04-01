import React from "react"

import english_internal from "../../utils/english_internal.json"
import { wpnSmall, wpnMedium } from "../../assets/imageImports"
import { Weapon } from "../../types.js"

interface WeaponImageProps {
  englishName: Weapon
  size: "SMALL" | "MEDIUM"
}

const WeaponImage: React.FC<WeaponImageProps> = ({ englishName, size }) => {
  const dictToUse: any = size === "MEDIUM" ? wpnMedium : wpnSmall
  const wh = "32px"
  return (
    <img
      src={dictToUse[english_internal[englishName]]}
      alt={englishName}
      title={englishName}
      style={size === "SMALL" ? { width: wh, height: wh } : undefined}
    />
  )
}

export default WeaponImage
