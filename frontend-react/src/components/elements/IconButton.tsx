import React from "react"
import { IconButton as ChakraIconButton } from "@chakra-ui/core"
import { IconType } from "react-icons/lib/cjs"

interface IconButtonProps {
  icon: IconType
  display?: string
  onClick?: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, display }) => {
  return (
    <ChakraIconButton
      aria-label=""
      icon={icon}
      display={display}
      variant="ghost"
      onClick={onClick}
      size="lg"
    />
  )
}

export default IconButton
