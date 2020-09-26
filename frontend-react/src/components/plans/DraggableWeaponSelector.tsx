import { Box, Flex } from "@chakra-ui/core"
import React, { useContext, useState } from "react"
import Draggable from "react-draggable"
import { useTranslation } from "react-i18next"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { weapons } from "../../utils/lists"
import WeaponImage from "../common/WeaponImage"

interface DraggableWeaponSelectorProps {
  addWeaponImage: (weapon: Weapon) => void
}

const DraggableWeaponSelector: React.FC<DraggableWeaponSelectorProps> = ({
  addWeaponImage,
}) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  const { t } = useTranslation()
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
            {t("plans;Weapons")}
          </div>
        </strong>
        <Box overflowY="scroll" height="50vh">
          <Flex flexWrap="wrap">
            {weapons.map((wpn) => (
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
