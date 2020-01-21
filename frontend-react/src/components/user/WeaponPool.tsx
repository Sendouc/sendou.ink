import React from "react"
import { Weapon } from "../../types"
import { Box, Flex } from "@chakra-ui/core"
import WeaponImage from "../common/WeaponImage"
import useTheme from "../../hooks/useTheme"

interface WeaponPoolProps {
  weapons: Weapon[]
}

const styles = {
  light: "1px solid rgba(0, 0, 0, .2)",
  dark: "1px solid rgba(255, 255, 255, .2)",
} as const

const WeaponPool: React.FC<WeaponPoolProps> = ({ weapons }) => {
  const { colorMode, grayWithShade } = useTheme()
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
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="xs"
        textTransform="uppercase"
      >
        Weapon pool
      </Box>
      <Flex>
        {weapons.map(wpn => (
          <Box mx="0.3em" key={wpn}>
            <WeaponImage englishName={wpn} size="SMALL" />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

export default WeaponPool
