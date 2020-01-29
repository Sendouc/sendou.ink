import React, { useState, useContext } from "react"
import Draggable from "react-draggable"
import { weapons } from "../../utils/lists"
import WeaponImage from "../common/WeaponImage"
import { Box, Flex } from "@chakra-ui/core"
import { Weapon } from "../../types"
import MyThemeContext from "../../themeContext"

interface DraggableWeaponSelector {
  addWeaponImage: (weapon: Weapon) => void
}

const DraggableWeaponSelector: React.FC<DraggableWeaponSelector> = ({
  addWeaponImage,
}) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  const [activeDrags, setActiveDrags] = useState(0)

  const onStart = () => {
    setActiveDrags(activeDrags + 1)
  }

  const onStop = () => {
    setActiveDrags(activeDrags - 1)
  }

  return (
    <Draggable handle="strong" onStart={onStart} onStop={onStop}>
      <Box
        position="fixed"
        zIndex={999}
        borderRadius="7px"
        boxShadow="7px 14px 13px 2px rgba(0,0,0,0.24)"
        background={darkerBgColor}
        textAlign="center"
        width="119px"
      >
        <strong style={{ cursor: "move" }}>
          <div
            style={{
              fontSize: "17px",
              borderRadius: "7px 7px 0 0",
              padding: "0.3em",
            }}
          >
            Weapons
          </div>
        </strong>
        <Box overflowY="scroll" height="50vh">
          <Flex flexWrap="wrap">
            {weapons.map(wpn => (
              <Box as="span" key={wpn} onClick={() => addWeaponImage(wpn)}>
                <WeaponImage size="SMALL" englishName={wpn} />
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>
    </Draggable>
  )
}

export default DraggableWeaponSelector
