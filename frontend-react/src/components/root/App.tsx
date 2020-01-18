import React, { useEffect } from "react"
import { useColorMode, Box } from "@chakra-ui/core"

import { MenuBar } from "./MenuBar"
import SideNav from "./SideNav"
import Routes from "./Routes"

const App: React.FC = () => {
  const { colorMode } = useColorMode()

  const bgColor = { light: "#eff0f3", dark: "#232946" }
  useEffect(() => {
    document.body.style.backgroundColor = bgColor[colorMode]
  }, [colorMode, bgColor])

  return (
    <Box
      marginLeft={[null, null, "250px"]}
      mt={["4em", null, "0"]}
      color={`textColor.${colorMode}`}
    >
      <SideNav />
      <MenuBar />
      <Box maxWidth="46em" pt={8} px={8} ml="auto" mr="auto">
        <Routes />
      </Box>
    </Box>
  )
}

export default App
