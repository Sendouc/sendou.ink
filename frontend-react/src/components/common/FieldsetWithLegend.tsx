import React from "react"
import { Box } from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

interface FieldsetWithLegendProps {
  children: React.ReactNode
  title: React.ReactNode
  titleFontSize: string
  dividerMode?: boolean
  centerTitle?: boolean
  fullWidth?: boolean
}

const FieldsetWithLegend: React.FC<FieldsetWithLegendProps> = ({
  children,
  title,
  titleFontSize,
  dividerMode = false,
  centerTitle = false,
  fullWidth = false,
}) => {
  const { borderStyle, textColor } = useContext(MyThemeContext)
  return (
    <Box
      as="fieldset"
      border={borderStyle}
      borderX={dividerMode ? "none" : undefined}
      borderBottom={dividerMode ? "none" : undefined}
      rounded={dividerMode ? undefined : "lg"}
      display="inline-block"
      p="1em"
      w={fullWidth ? "100%" : undefined}
    >
      <Box
        as="legend"
        color={textColor}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize={titleFontSize}
        textAlign={centerTitle ? "center" : undefined}
        px="3px"
      >
        {title}
      </Box>
      {children}
    </Box>
  )
}

export default FieldsetWithLegend
