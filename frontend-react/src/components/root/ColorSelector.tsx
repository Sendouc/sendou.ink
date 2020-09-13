import {
  Box,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  useTheme as useChakraTheme,
} from "@chakra-ui/core"
import { writeStorage } from "@rehooks/local-storage"
import React, { useContext } from "react"
import { ColorResult } from "react-color"
import { useTranslation } from "react-i18next"
import MyThemeContext from "../../themeContext"
import { themeColors as choices } from "../../utils/lists"

export const themeColors = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "cyan",
  "purple",
  "pink",
] as const

const ColorSelector = () => {
  const { t } = useTranslation()
  const { themeColorHex, darkerBgColor } = useContext(MyThemeContext)
  const theme = useChakraTheme()

  const hexCodes = choices.map((color) =>
    theme.colors[color]["500"].toLowerCase()
  )

  const handleColorChoice = (color: ColorResult) => {
    const colorForLocalStorage = choices[hexCodes.indexOf(color)]

    writeStorage("colorPreference", colorForLocalStorage)
  }

  return (
    <Menu>
      <MenuButton>
        <Box
          cursor="pointer"
          height="20px"
          width="20px"
          backgroundColor={themeColorHex}
          borderRadius="50%"
          mx="10px"
        />
      </MenuButton>
      <MenuList bg={darkerBgColor}>
        <MenuOptionGroup
          title={t("navigation;Choose theme")}
          value={themeColorHex.toLowerCase()}
        >
          {hexCodes.map((hexCode, i) => (
            <MenuItemOption
              value={hexCode}
              onClick={() => handleColorChoice(hexCode)}
            >
              <Box
                cursor="pointer"
                height="20px"
                width="20px"
                backgroundColor={hexCode}
                borderRadius="50%"
                mx="10px"
                display="inline-block"
              />
              {themeColors[i]}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default ColorSelector
