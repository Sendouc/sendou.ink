import React from "react"
import Box from "./Box"

interface LabelProps {
  required?: boolean
}

const Label: React.FC<LabelProps> = ({ children, required }) => {
  return (
    <Box mb="0.2em">
      <b>{children}</b>{" "}
      {required && (
        <Box as="span" color="red.500">
          *
        </Box>
      )}
    </Box>
  )
}

export default Label
