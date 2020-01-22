import React, { useContext } from "react"
import { Button as ChakraButton, useColorMode } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface ButtonProps {
  children: string | string[]
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  const { themeColor } = useContext(MyThemeContext)
  return (
    <ChakraButton variantColor={themeColor} onClick={onClick}>
      {children}
    </ChakraButton>
  )
}
