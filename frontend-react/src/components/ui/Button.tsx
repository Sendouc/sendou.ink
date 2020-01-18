import React from "react"
import { Button as ChakraButton, useColorMode } from "@chakra-ui/core"

interface ButtonProps {
  children: string | string[]
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  const { colorMode } = useColorMode()
  const color = { light: "orange", dark: "pink" }
  return (
    <ChakraButton variantColor={color[colorMode]} onClick={onClick}>
      {children}
    </ChakraButton>
  )
}
