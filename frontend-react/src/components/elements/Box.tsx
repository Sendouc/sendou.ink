import React from "react"
import { Box as ChakraBox, BoxProps } from "@chakra-ui/core"

interface MyBoxProps {
  children: JSX.Element | JSX.Element[]
}

const Box: React.FC<BoxProps & MyBoxProps> = ({ children, ...props }) => {
  return <ChakraBox {...props}>{children}</ChakraBox>
}

export default Box
