import React from "react"
import { Box, useColorMode } from "@chakra-ui/core"

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
  const { colorMode } = useColorMode()
  const styles = {
    light: "1px solid rgba(0, 0, 0, .2)",
    dark: "1px solid rgba(255, 255, 255, .2)",
  }
  const borderStyle: string = styles[colorMode]
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
