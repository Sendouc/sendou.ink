import { Box } from "@chakra-ui/core"
import React, { useContext } from "react"
import { SideNavContent } from "./SideNavContent"
import MyThemeContext from "../../themeContext"

const shadow = {
  light: "0px 1px 10px 8px rgba(0,0,0,0.15)",
  dark: "0px 1px 10px 8px rgba(255,255,255,0.04)",
} as const

const SideNav = () => {
  const { darkerBgColor, themeColorHexLighter } = useContext(MyThemeContext)
  return (
    <Box
      bg={darkerBgColor}
      borderRight="1px solid"
      borderColor={themeColorHexLighter}
      height="100%"
      width="250px"
      position="fixed"
      zIndex={1}
      top={0}
      left={0}
      overflowX="hidden"
      display={["none", null, "block"]}
    >
      <SideNavContent />
    </Box>
  )
}

export default SideNav
