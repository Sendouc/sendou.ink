import React from "react"
import { HeadGear, ClothingGear, ShoesGear } from "../../types"
import english_internal from "../../utils/english_internal.json"
import { Box } from "@chakra-ui/core"
import { useTranslation } from "react-i18next"

interface GearImageProps {
  englishName?: HeadGear | ClothingGear | ShoesGear
  renderNullIfNoName?: boolean
  mini?: boolean
}

const GearImage: React.FC<GearImageProps> = ({
  englishName,
  renderNullIfNoName,
  mini,
}) => {
  const { t } = useTranslation()
  if (!englishName && renderNullIfNoName) return null
  if (!englishName) return <Box />
  const wh = "32px"
  return (
    <img
      alt={t(`game;${englishName}`)}
      src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${english_internal[englishName]}.png`}
      title={t(`game;${englishName}`)}
      style={
        mini ? { width: wh, height: wh, display: "inline-block" } : undefined
      }
    />
  )
}

export default GearImage
