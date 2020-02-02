import React from "react"
import { Box as ChakraBox, BoxProps } from "@chakra-ui/core"

interface MyBoxProps {
  children?: JSX.Element | JSX.Element[] | string | string[]
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
