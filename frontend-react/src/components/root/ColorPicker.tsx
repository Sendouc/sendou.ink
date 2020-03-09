import React, { useContext } from "react"
import {
  Box,
  PopoverTrigger,
  Popover,
  PopoverBody,
  PopoverContent,
  useTheme as useChakraTheme,
} from "@chakra-ui/core"
import { CirclePicker, ColorResult } from "react-color"
import { writeStorage } from "@rehooks/local-storage"
import { themeColors as choices } from "../../utils/lists"
import MyThemeContext from "../../themeContext"

const size = "20px" as const

const ColorPicker: React.FC = () => {
  const { themeColorHex, bgColor } = useContext(MyThemeContext)
  const theme = useChakraTheme()

  const hexCodes = choices.map(color =>
    theme.colors[color]["500"].toLowerCase()
  )

  const handleColorChoice = (color: ColorResult) => {
    const colorForLocalStorage =
      choices[hexCodes.indexOf(color.hex.toLowerCase())]

    writeStorage("colorPreference", colorForLocalStorage)
  }

  return (
    <Popover placement="top">
      <PopoverTrigger>
        <Box
          cursor="pointer"
          height={size}
          width={size}
          backgroundColor={themeColorHex}
          borderRadius="50%"
          display="inline-block"
          mr="11px"
          ml="10px"
        />
      </PopoverTrigger>
      <PopoverContent zIndex={4} width="220px" backgroundColor={bgColor}>
        <PopoverBody textAlign="center">
          <CirclePicker
            width="220px"
            colors={hexCodes}
            onChangeComplete={handleColorChoice}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default ColorPicker
