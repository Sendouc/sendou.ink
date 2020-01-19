import React from "react"
import { Box, useColorMode } from "@chakra-ui/core"
import useTheme from "../../hooks/useTheme"

interface DividingBoxProps {
  children: JSX.Element | JSX.Element[]
  location: "top" | "left" | "bottom"
  margin?: string
}

const DividingBox: React.FC<DividingBoxProps> = ({
  children,
  location,
  margin = "0.4em",
}) => {
  const { borderStyle } = useTheme()
  return (
    <Box
      borderLeft={location === "left" ? borderStyle : undefined}
      ml={location === "left" ? margin : undefined}
      borderTop={location === "top" ? borderStyle : undefined}
      mt={location === "top" ? margin : undefined}
      borderBottom={location === "bottom" ? borderStyle : undefined}
      mb={location === "bottom" ? margin : undefined}
    >
      {children}
    </Box>
  )
}

export default DividingBox
