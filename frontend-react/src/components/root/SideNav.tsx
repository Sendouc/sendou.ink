import { Box } from "@chakra-ui/core"
import React from "react"
import { SideNavContent } from "./SideNavContent"
import useTheme from "../../hooks/useTheme"

const shadow = {
  light: "0px 1px 10px 8px rgba(0,0,0,0.15)",
  dark: "0px 1px 10px 8px rgba(255,255,255,0.04)",
} as const

const SideNav = () => {
  const { darkerBgColor, colorMode } = useTheme()
  return (
    <Box
      bg={darkerBgColor}
      boxShadow={shadow[colorMode]}
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
