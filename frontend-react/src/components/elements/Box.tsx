import React from "react"
import { Box as ChakraBox, BoxProps } from "@chakra-ui/core"

interface MyBoxProps {
  asFlex?: boolean
}

const Box: React.FC<BoxProps & MyBoxProps> = ({
  children,
  asFlex,
  ...props
}) => {
  return (
    <ChakraBox display={asFlex ? "flex" : undefined} {...props}>
      {children}
    </ChakraBox>
  )
}

export default Box
