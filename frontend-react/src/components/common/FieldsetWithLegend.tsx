import React from "react"
import { Box, BoxProps } from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

interface FieldsetWithLegendProps {
  children: React.ReactNode
  title: string
  titleFontSize: string
}

const FieldsetWithLegend: React.FC<FieldsetWithLegendProps> = ({
  children,
  title,
  titleFontSize,
}) => {
  const { borderStyle, grayWithShade } = useContext(MyThemeContext)
  return (
    <Box
      as="fieldset"
      maxW="sm"
      border={borderStyle}
      rounded="lg"
      display="inline-block"
      p="1em"
    >
      <Box
        as="legend"
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize={titleFontSize}
      >
        {title}
      </Box>
      {children}
    </Box>
  )
}

export default FieldsetWithLegend
