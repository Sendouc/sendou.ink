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
  color?: string
}

const IconButton: React.FC<IconButtonProps> = ({
  colored,
  icon,
  disabled,
  onClick,
  color,
}) => {
  const { themeColor } = useContext(MyThemeContext)
  return (
    <ChakraIconButton
      aria-label=""
      icon={icon}
      isRound
      variant="ghost"
      onClick={onClick}
      size="lg"
      variantColor={colored ? themeColor : undefined}
      color={color}
      isDisabled={disabled}
    />
  )
}

export default IconButton
