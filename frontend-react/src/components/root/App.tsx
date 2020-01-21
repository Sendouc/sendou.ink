import React from "react"
import { Box } from "@chakra-ui/core"

import { MenuBar } from "./MenuBar"
import SideNav from "./SideNav"
import Routes from "./Routes"
import useTheme from "../../hooks/useTheme"

const App: React.FC = () => {
  const { bgColor, textColor } = useTheme()

  return (
    <Box
      marginLeft={[null, null, "250px"]}
      mt={["4em", null, "0"]}
      color={textColor}
      bg={bgColor}
      minH="100vh"
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
