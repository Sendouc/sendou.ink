import React from "react"

import english_internal from "../../utils/english_internal.json"
import { weapons } from "../../assets/imageImports"
import { Weapon } from "../../types.js"
import { useTranslation } from "react-i18next"

interface WeaponImageProps {
  englishName: Weapon
  size: "SMALL" | "SMEDIUM" | "MEDIUM" | "BIG"
  asInlineBlock?: boolean
  noTitle?: boolean
}

const sizeWhMap: Record<
  "SMALL" | "SMEDIUM" | "MEDIUM" | "BIG",
  string | undefined
> = {
  SMALL: "32px",
  SMEDIUM: "48px",
  MEDIUM: "64px",
  BIG: undefined,
}

const WeaponImage: React.FC<WeaponImageProps> = ({
  englishName,
  size,
  asInlineBlock,
  noTitle,
}) => {
  const { t } = useTranslation()
  const dictToUse: any = weapons
  const wh = sizeWhMap[size]
  return (
    <img
      src={dictToUse[english_internal[englishName]]}
      alt={t(`game;${englishName}`)}
      title={noTitle ? undefined : t(`game;${englishName}`)}
      style={{
        width: wh,
        height: wh,
        display: asInlineBlock ? "inline-block" : undefined,
      }}
    />
  )
}

export default WeaponImage
