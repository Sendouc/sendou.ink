import { useColorMode, useTheme as useChakraTheme } from "@chakra-ui/core"
import { useLocalStorage } from "@rehooks/local-storage"
import { ThemeColor } from "../types"

interface Theme {
  colorMode: "light" | "dark"
  bgColor: "#eff0f3" | "#232946"
  darkerBgColor: "#D6D7DA" | "#0A102D"
  textColor: "#0d0d0d" | "#fffffe"
  borderStyle:
    | "1px solid rgba(0, 0, 0, .2)"
    | "1px solid rgba(255, 255, 255, .2)"
  grayWithShade: "gray.300" | "gray.600"
  themeColorWithShade: string
  themeColorHex: string
  themeColor: ThemeColor
}

function useTheme(): Theme {
  const { colorMode } = useColorMode()
  const chakraTheme = useChakraTheme()
  const light = colorMode === "light"
  const bgColor = light ? "#eff0f3" : "#232946"
  const darkerBgColor = light ? "#D6D7DA" : "#0A102D"
  const textColor = light ? "#0d0d0d" : "#fffffe"
  const grayWithShade = light ? "gray.600" : "gray.300"
  const borderStyle = light
    ? "1px solid rgba(0, 0, 0, .2)"
    : "1px solid rgba(255, 255, 255, .2)"
  const [themeColorFromStorage] = useLocalStorage<ThemeColor>("colorPreference")

  const themeColor = themeColorFromStorage
    ? themeColorFromStorage
    : light
    ? "pink"
    : "orange"

  const themeColorWithShade = light ? `${themeColor}.500` : `${themeColor}.200`

  const themeColorHex = chakraTheme.colors[themeColor]["500"]

  return {
    colorMode,
    bgColor,
    darkerBgColor,
    textColor,
    borderStyle,
    themeColorWithShade,
    grayWithShade,
    themeColorHex,
    themeColor,
  }
}

export default useTheme
