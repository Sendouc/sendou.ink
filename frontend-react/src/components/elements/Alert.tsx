import React from "react"
import { Alert as ChakraAlert, AlertIcon, CloseButton } from "@chakra-ui/core"

interface AlertProps {
  children: string | string[]
  status: "error" | "success" | "warning" | "info"
  onClose?: () => void
}

const Alert: React.FC<AlertProps> = ({ children, status, onClose }) => {
  return (
    <ChakraAlert status={status} borderRadius="5px" mt="2em">
      <AlertIcon />
      {children}
      {onClose && (
        <CloseButton
          onClick={onClose}
          position="absolute"
          right="8px"
          top="8px"
        />
      )}
    </ChakraAlert>
  )
}

export default Alert
