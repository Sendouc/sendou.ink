import { Box } from "@chakra-ui/core"
import React, { useContext, Suspense } from "react"
import { SideNavContent } from "./SideNavContent"
import MyThemeContext from "../../themeContext"
import Loading from "../common/Loading"

const SideNav = () => {
  const {
    darkerBgColor,
    themeColorHex,
    themeColorHexLighter,
    colorMode,
  } = useContext(MyThemeContext)
  return (
    <Box
      bg={darkerBgColor}
      borderRight="2px solid"
      borderColor={colorMode === "light" ? themeColorHex : themeColorHexLighter}
      height="100%"
      width="250px"
      position="fixed"
      zIndex={1}
      top={0}
      left={0}
      overflowX="hidden"
      display={["none", null, "block"]}
    >
      <Suspense fallback={<Loading />}>
        <SideNavContent />
      </Suspense>
    </Box>
  )
}

export default SideNav
