import React from "react"
import Alert from "../elements/Alert"

interface ErrorProps {
  errorMessage: string
}

const Error: React.FC<ErrorProps> = ({ errorMessage }) => {
  return <Alert status="error">{errorMessage}</Alert>
}

export default Error
