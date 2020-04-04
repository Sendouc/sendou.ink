import React, { useContext } from "react"
import "./SubHeader.css"
import MyThemeContext from "../../themeContext"
import { Box, useTheme } from "@chakra-ui/core"

interface SubHeaderProps {
  children: string[] | string
}

const SubHeader: React.FC<SubHeaderProps> = ({ children }) => {
  const { themeColorHex, themeColorHexLighter, colorMode } = useContext(
    MyThemeContext
  )
  const style = {
    "--sub-header-border":
      colorMode === "dark" ? themeColorHexLighter : themeColorHex,
  } as React.CSSProperties
  return (
    <h2 className="decorated">
      <span style={style}>{children}</span>
    </h2>
  )
}

export default SubHeader
