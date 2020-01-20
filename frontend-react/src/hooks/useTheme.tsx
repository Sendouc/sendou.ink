import { useColorMode, useTheme as useChakraTheme } from "@chakra-ui/core"
import { useLocalStorage } from "@rehooks/local-storage"
import { ThemeColor } from "../types"

interface Theme {
  bgColor: "#eff0f3" | "#232946"
  textColor: "#0d0d0d" | "#fffffe"
  borderStyle:
    | "1px solid rgba(0, 0, 0, .2)"
    | "1px solid rgba(255, 255, 255, .2)"
  themeColorWithShade: string
  themeColorHex: string
  themeColor: ThemeColor
}

function useTheme(): Theme {
  const { colorMode } = useColorMode()
  const chakraTheme = useChakraTheme()
  const light = colorMode === "light"
  const bgColor = light ? "#eff0f3" : "#232946"
  const textColor = light ? "#0d0d0d" : "#fffffe"
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
    bgColor,
    textColor,
    borderStyle,
    themeColorWithShade,
    themeColorHex,
    themeColor,
  }
}

export default useTheme
