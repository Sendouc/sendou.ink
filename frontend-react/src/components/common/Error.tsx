import React from "react"
import { Alert, AlertIcon } from "@chakra-ui/core"

interface ErrorProps {
  errorMessage: string
}

const Error: React.FC<ErrorProps> = ({ errorMessage }) => {
  return (
    <Alert status="error">
      <AlertIcon color="red.500" />
      {errorMessage}
    </Alert>
  )
}

export default Error
