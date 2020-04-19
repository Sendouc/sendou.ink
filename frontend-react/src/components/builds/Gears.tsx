import React from "react"
import { Build } from "../../types"
import GearImage from "./GearImage"
import { Flex, Box } from "@chakra-ui/core"

interface GearsProps {
  build: Build
}

const Gears: React.FC<GearsProps> = ({ build }) => {
  if (!build.headgearItem && !build.clothingItem && !build.shoesItem) {
    return <Box h="30px" />
  }
  return (
    <Flex justifyContent="center">
      <Box w={build.headgearItem ? "85px" : undefined} h="85px" mx="2px">
        <GearImage englishName={build.headgearItem} renderNullIfNoName />
      </Box>
      <Box w={build.clothingItem ? "85px" : undefined} h="85px" mx="2px">
        <GearImage englishName={build.clothingItem} renderNullIfNoName />
      </Box>
      <Box w={build.shoesItem ? "85px" : undefined} h="85px" mx="2px">
        <GearImage englishName={build.shoesItem} renderNullIfNoName />
      </Box>
    </Flex>
  )
}

export default Gears
