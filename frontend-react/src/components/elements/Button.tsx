import React from "react"
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
} from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import { IconType } from "react-icons/lib/cjs"

interface ButtonProps {
  children: string | string[]
  onClick?: () => void
  size?: "xs" | "sm" | "lg" | "md"
  icon?: IconType
  width?: string
  outlined?: boolean
  disabled?: boolean
  loading?: boolean
}

const Button: React.FC<ButtonProps & ChakraButtonProps> = ({
  children,
  onClick,
  icon,
  size,
  disabled,
  loading,
  width,
  outlined = false,
  ...props
}) => {
  const { themeColor } = useContext(MyThemeContext)
  return (
    <ChakraButton
      variant={outlined ? "outline" : "solid"}
      variantColor={themeColor}
      leftIcon={icon}
      onClick={onClick}
      size={size}
      isDisabled={disabled}
      isLoading={loading}
      width={width ?? undefined}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}

export default Button
