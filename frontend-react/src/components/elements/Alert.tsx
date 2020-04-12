import React from "react"
import { Alert as ChakraAlert, AlertIcon, CloseButton } from "@chakra-ui/core"

interface AlertProps {
  children: string | string[] | JSX.Element | JSX.Element[]
  status: "error" | "success" | "warning" | "info"
  mt?: string
  onClose?: () => void
}

const Alert: React.FC<AlertProps> = ({
  children,
  status,
  onClose,
  mt = "2em",
}) => {
  return (
    <ChakraAlert status={status} borderRadius="5px" mt={mt}>
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
