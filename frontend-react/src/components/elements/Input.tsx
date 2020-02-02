import React, { useContext } from "react"
import { Input as ChakraInput } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import Label from "./Label"
import Box from "./Box"

interface InputProps {
  value?: string
  setValue: (value: string) => void
  placeholder: string
  label: string
  limit?: number
  required?: boolean
}

const Input: React.FC<InputProps> = ({
  value,
  setValue,
  label,
  required,
  limit,
}) => {
  const { themeColorHex, grayWithShade } = useContext(MyThemeContext)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  return (
    <>
      {label && <Label required={required}>{label}</Label>}
      <ChakraInput
        value={value ?? ""}
        onChange={handleChange}
        focusBorderColor={themeColorHex}
      />
      {limit && (
        <Box
          as="span"
          color={(value ?? "").length > limit ? "red.500" : grayWithShade}
        >
          {(value ?? "").length}/{limit}
        </Box>
      )}
    </>
  )
}

export default Input
