import React from "react"
import { Box, useColorMode, useTheme as useChakraTheme } from "@chakra-ui/core"

import { MenuBar } from "./MenuBar"
import SideNav from "./SideNav"
import Routes from "./Routes"
import useLocalStorage from "@rehooks/local-storage"
import { ThemeColor } from "../../types"
import { MyThemeProvider } from "../../themeContext"
import { Theme } from "../../types"
import Footer from "./Footer"
import { useEffect } from "react"

const App: React.FC = () => {
  const chakraTheme = useChakraTheme()
  const { colorMode } = useColorMode()
  const [themeColorFromStorage] = useLocalStorage<ThemeColor>("colorPreference")

  const themeColor = themeColorFromStorage
    ? themeColorFromStorage
    : colorMode === "light"
    ? "pink"
    : "orange"

  const theme = {
    light: {
      colorMode: "light",
      bgColor: "#eff0f3",
      //darkerBgColor: "#D6D7DA", FFF0F5
      darkerBgColor: "#FFFAFA",
      textColor: "#0d0d0d",
      borderStyle: "1px solid rgba(0, 0, 0, .2)",
      themeColorWithShade: `${themeColor}.500`,
      grayWithShade: "gray.600",
      themeColorHex: chakraTheme.colors[themeColor]["500"],
      themeColorHexLighter: chakraTheme.colors[themeColor]["200"],
      themeColor,
    } as Theme,
    dark: {
      colorMode: "dark",
      bgColor: "#232946",
      darkerBgColor: "#0A102D",
      textColor: "#fffffe",
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
  }, [themeColorFromStorage])

  return (
    <MyThemeProvider value={theme[colorMode]}>
      <Box
        marginLeft={[null, null, "250px"]}
        mt={["4em", null, "0"]}
        color={theme[colorMode].textColor}
        bg={theme[colorMode].bgColor}
        minH="100vh"
        fontFamily="'Montserrat', sans-serif"
        pb="20px"
      >
        <SideNav />
        <MenuBar />
        <Box maxWidth="1100px" pt={8} px={8} ml="auto" mr="auto">
          <Box minH="calc(100vh - 210px)">
            <Routes />
          </Box>
          <Footer />
        </Box>
      </Box>
    </MyThemeProvider>
  )
}

export default App
