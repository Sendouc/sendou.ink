import React from "react"
import { HeadGear, ClothingGear, ShoesGear } from "../../types"
import english_internal from "../../utils/english_internal.json"
import { Box } from "@chakra-ui/core"

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
  if (!englishName && renderNullIfNoName) return null
  if (!englishName) return <Box />
  const wh = mini ? "32px" : "128px"
  return (
    <img
      alt={englishName}
      src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear${
        mini ? "-icon" : ""
      }/${english_internal[englishName]}.png`}
      title={englishName}
      style={{ width: wh, height: wh }}
    />
  )
}

export default GearImage
