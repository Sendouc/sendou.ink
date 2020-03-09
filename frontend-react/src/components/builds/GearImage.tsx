import React from "react"
import { HeadGear, ClothingGear, ShoesGear } from "../../types"
import english_internal from "../../utils/english_internal.json"
import { Box } from "@chakra-ui/core"

interface GearImageProps {
  englishName?: HeadGear | ClothingGear | ShoesGear
  renderNullIfNoName?: boolean
}

const GearImage: React.FC<GearImageProps> = ({
  englishName,
  renderNullIfNoName,
}) => {
  if (!englishName && renderNullIfNoName) return null
  if (!englishName) return <Box />
  return (
    <img
      alt={englishName}
      src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${english_internal[englishName]}.png`}
      title={englishName}
    />
  )
}

export default GearImage
