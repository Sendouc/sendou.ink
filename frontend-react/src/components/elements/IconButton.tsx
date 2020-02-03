import React from "react"
import { IconButton as ChakraIconButton } from "@chakra-ui/core"
import { IconType } from "react-icons/lib/cjs"

interface IconButtonProps {
  icon: IconType
  onClick: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick }) => {
  return (
    <ChakraIconButton
      aria-label=""
      icon={icon}
      variant="ghost"
      onClick={onClick}
      size="lg"
    />
  )
}

export default IconButton
