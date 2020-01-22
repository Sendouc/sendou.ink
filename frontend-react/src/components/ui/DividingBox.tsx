import React, { useContext } from "react"
import { Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface DividingBoxProps {
  children: JSX.Element | JSX.Element[] | string
  location: "top" | "left" | "bottom" | "right"
  margin?: string
  width?: string
}

const DividingBox: React.FC<DividingBoxProps> = ({
  children,
  location,
  width = undefined,
  margin = "0.4em",
}) => {
  const { borderStyle } = useContext(MyThemeContext)
  return (
    <Box
      borderLeft={location === "left" ? borderStyle : undefined}
      ml={location === "left" ? margin : undefined}
      borderTop={location === "top" ? borderStyle : undefined}
      mt={location === "top" ? margin : undefined}
      borderBottom={location === "bottom" ? borderStyle : undefined}
      mb={location === "bottom" ? margin : undefined}
      borderRight={location === "right" ? borderStyle : undefined}
      mr={location === "right" ? margin : undefined}
      width={width}
    >
      {children}
    </Box>
  )
}

export default DividingBox
