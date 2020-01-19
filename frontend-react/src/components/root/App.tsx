import React, { useEffect } from "react"
import { useColorMode, Box } from "@chakra-ui/core"

import { MenuBar } from "./MenuBar"
import SideNav from "./SideNav"
import Routes from "./Routes"
import useTheme from "../../hooks/useTheme"

const App: React.FC = () => {
  const { bgColor, themeColor } = useTheme()

  useEffect(() => {
    document.body.style.backgroundColor = bgColor
  }, [bgColor])

  return (
    <Box
      marginLeft={[null, null, "250px"]}
      mt={["4em", null, "0"]}
      color={`textColor.${themeColor}`}
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
