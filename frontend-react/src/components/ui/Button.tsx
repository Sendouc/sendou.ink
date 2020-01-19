import React from "react"
import { Button as ChakraButton, useColorMode } from "@chakra-ui/core"
import useTheme from "../../hooks/useTheme"

interface ButtonProps {
  children: string | string[]
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  const { themeColor } = useTheme()
  return (
    <ChakraButton variantColor={themeColor} onClick={onClick}>
      {children}
    </ChakraButton>
  )
}
