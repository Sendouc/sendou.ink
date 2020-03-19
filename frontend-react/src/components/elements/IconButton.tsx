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
}

const IconButton: React.FC<IconButtonProps> = ({
  colored,
  icon,
  disabled,
  onClick,
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
      isDisabled={disabled}
    />
  )
}

export default IconButton
