import React from "react"
import { Grid } from "@chakra-ui/core"
import GearImage from "./GearImage"
import { Build } from "../../types"
import AbilityIcon from "./AbilityIcon"

interface ViewGearProps {
  build: Build
}

const ViewGear: React.FC<ViewGearProps> = ({ build }) => {
  const noItems =
    !build.headgearItem && !build.clothingItem && !build.clothingItem
  return (
    <Grid
      gridTemplateColumns={`${noItems ? "" : "75px "} 60px 45px 45px 45px`}
      gridRowGap="10px"
      justifyItems="center"
      alignItems="center"
      mt={noItems ? "2" : "0"}
    >
      <GearImage
        englishName={build.headgearItem}
        renderNullIfNoName={noItems}
      />
      {build.headgear.map((ability, index) => (
        <AbilityIcon
          key={index}
          ability={ability}
          size={index === 0 ? "MAIN" : "SUB"}
        />
      ))}
      <GearImage
        englishName={build.clothingItem}
        renderNullIfNoName={noItems}
      />
      {build.clothing.map((ability, index) => (
        <AbilityIcon
          key={index}
          ability={ability}
          size={index === 0 ? "MAIN" : "SUB"}
        />
      ))}
      <GearImage englishName={build.shoesItem} renderNullIfNoName={noItems} />
      {build.shoes.map((ability, index) => (
        <AbilityIcon
          key={index}
          ability={ability}
          size={index === 0 ? "MAIN" : "SUB"}
        />
      ))}
    </Grid>
  )
}

export default ViewGear
