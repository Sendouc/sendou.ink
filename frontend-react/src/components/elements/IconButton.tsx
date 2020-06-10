import React from "react"
import { IconButton as ChakraIconButton } from "@chakra-ui/core"
import { IconType } from "react-icons/lib/cjs"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

interface IconButtonProps {
  icon: IconType
  onClick?: () => void
  colored?: boolean
  disabled?: boolean
  loading?: boolean
  color?: string
  size?: "sm" | "md" | "lg"
}

const IconButton: React.FC<IconButtonProps> = ({
  colored,
  icon,
  disabled,
  loading,
  onClick,
  color,
  size = "lg",
}) => {
  const { themeColorWithShade } = useContext(MyThemeContext)

  const getColor = () => {
    if (color) return color
    if (colored) return themeColorWithShade
    return undefined
  }

  return (
    <ChakraIconButton
      aria-label=""
      icon={icon}
      isRound
      variant="ghost"
      onClick={onClick}
      size={size}
      color={getColor()}
      isDisabled={disabled}
      isLoading={loading}
    />
  )
}

export default IconButton
