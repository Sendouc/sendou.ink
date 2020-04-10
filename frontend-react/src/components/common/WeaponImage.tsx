import React from "react"

import english_internal from "../../utils/english_internal.json"
import { wpnMedium } from "../../assets/imageImports"
import { Weapon } from "../../types.js"

interface WeaponImageProps {
  englishName: Weapon
  size: "SMALL" | "MEDIUM" | "BIG"
  asInlineBlock?: boolean
  noTitle?: boolean
}

const sizeWhMap: Record<"SMALL" | "MEDIUM" | "BIG", string | undefined> = {
  SMALL: "32px",
  MEDIUM: "64px",
  BIG: undefined,
}

const WeaponImage: React.FC<WeaponImageProps> = ({
  englishName,
  size,
  asInlineBlock,
  noTitle,
}) => {
  const dictToUse: any = wpnMedium
  const wh = sizeWhMap[size]
  return (
    <img
      src={dictToUse[english_internal[englishName]]}
      alt={englishName}
      title={noTitle ? undefined : englishName}
      style={{
        width: wh,
        height: wh,
        display: asInlineBlock ? "inline-block" : undefined,
      }}
    />
  )
}

export default WeaponImage
