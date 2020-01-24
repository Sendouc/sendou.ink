import React from "react"
import { Weapon } from "../../types"
import { Box, Flex } from "@chakra-ui/core"
import WeaponImage from "../common/WeaponImage"
import FieldsetWithLegend from "../common/FieldsetWithLegend"

interface WeaponPoolProps {
  weapons: Weapon[]
}

const WeaponPool: React.FC<WeaponPoolProps> = ({ weapons }) => {
  return (
    <FieldsetWithLegend title="WEAPON POOL" titleFontSize="xs">
      <Flex>
        {weapons.map(wpn => (
          <Box mx="0.3em" key={wpn}>
            <WeaponImage englishName={wpn} size="SMALL" />
          </Box>
        ))}
      </Flex>
    </FieldsetWithLegend>
  )
}

export default WeaponPool
