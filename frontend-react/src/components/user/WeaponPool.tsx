import React from "react"
import { Weapon } from "../../types"
import { Box, Flex, useColorMode } from "@chakra-ui/core"
import WeaponImage from "../common/WeaponImage"

interface WeaponPoolProps {
  weapons: Weapon[]
}

const WeaponPool: React.FC<WeaponPoolProps> = ({ weapons }) => {
  const { colorMode } = useColorMode()
  const styles = {
    light: "1px solid rgba(0, 0, 0, .2)",
    dark: "1px solid rgba(255, 255, 255, .2)",
  }
  const borderStyle: string = styles[colorMode]
  return (
    <Box
      as="fieldset"
      maxW="sm"
      border={borderStyle}
      rounded="lg"
      overflow="hidden"
      display="inline-block"
      p="1em"
    >
      <Box
        as="legend"
        color="gray.500"
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="xs"
        textTransform="uppercase"
        textAlign="left"
      >
        Weapon pool
      </Box>
      <Flex>
        {weapons.map(wpn => (
          <Box mx="0.3em">
            <WeaponImage englishName={wpn} size="SMALL" />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

export default WeaponPool
