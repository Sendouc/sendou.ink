import React from "react"
import { Alert as ChakraAlert, AlertIcon } from "@chakra-ui/core"

interface AlertProps {
  children: string | string[]
  status: "error" | "success" | "warning" | "info"
}

const Alert: React.FC<AlertProps> = ({ children, status }) => {
  return (
    <ChakraAlert status={status} borderRadius="5px" mt="2em">
      <AlertIcon />
      {children}
    </ChakraAlert>
  )
}

export default Alert
