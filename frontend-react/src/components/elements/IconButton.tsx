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
}

const IconButton: React.FC<IconButtonProps> = ({
  colored,
  icon,
  disabled,
  loading,
  onClick,
  color,
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
      size="lg"
      color={getColor()}
      isDisabled={disabled}
      isLoading={loading}
    />
  )
}

export default IconButton
