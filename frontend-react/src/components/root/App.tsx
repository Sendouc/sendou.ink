import { useColorMode, useTheme as useChakraTheme } from "@chakra-ui/core"
import useLocalStorage from "@rehooks/local-storage"
import React, { useEffect } from "react"
import { MyThemeProvider } from "../../themeContext"
import { Theme, ThemeColor } from "../../types"
import "./App.css"
import Layout from "./Layout"
import Routes from "./Routes"

const App: React.FC = () => {
  const chakraTheme = useChakraTheme()
  let { colorMode = "dark" } = useColorMode()
  //@ts-ignore
  if (colorMode === "") colorMode = "dark"
  const [themeColorFromStorage] = useLocalStorage<ThemeColor>("colorPreference")

  console.log({ chakraTheme, colorMode })

  const themeColor = themeColorFromStorage
    ? themeColorFromStorage
    : colorMode === "light"
    ? "pink"
    : "orange"

  const theme = {
    light: {
      colorMode: "light",
      bgColor: "#eff0f3",
      darkerBgColor: "#FFFAFA",
      textColor: "blackAlpha.900",
      borderStyle: "1px solid rgba(0, 0, 0, .2)",
      themeColorWithShade: `${themeColor}.500`,
      grayWithShade: "gray.600",
      themeColorHex: chakraTheme.colors[themeColor]["500"],
      themeColorHexLighter: chakraTheme.colors[themeColor]["200"],
      themeColor,
    } as Theme,
    dark: {
      colorMode: "dark",
      bgColor: "#031e3e",
      darkerBgColor: "#0e2a56",
      textColor: "whiteAlpha.900",
      borderStyle: "1px solid rgba(255, 255, 255, .2)",
      themeColorWithShade: `${themeColor}.200`,
      grayWithShade: "gray.300",
      themeColorHex: chakraTheme.colors[themeColor]["500"],
      themeColorHexLighter: chakraTheme.colors[themeColor]["200"],
      themeColor,
    } as Theme,
  }

  useEffect(() => {
    const favicon = document.getElementById("favicon") as HTMLLinkElement
    if (!favicon) return
    favicon.href = `/favicon_${themeColor}.png`
  }, [themeColorFromStorage, themeColor])

  return (
    <MyThemeProvider value={theme[colorMode]}>
      <Layout>
        <Routes />
      </Layout>
    </MyThemeProvider>
  )
}

export default App
