import React, { useContext } from "react"
import {
  Input as ChakraInput,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import Label from "./Label"
import Box from "./Box"

interface InputProps {
  value?: string
  setValue: (value: string) => void
  label: string
  limit?: number
  required?: boolean
  disabled?: boolean
  textLeft?: string
}

const Input: React.FC<InputProps> = ({
  value,
  setValue,
  label,
  required,
  disabled,
  limit,
  textLeft,
}) => {
  const { themeColorHex, grayWithShade, darkerBgColor } = useContext(
    MyThemeContext
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  return (
    <>
      {label && <Label required={required}>{label}</Label>}
      <InputGroup>
        {textLeft && <InputLeftAddon>{textLeft}</InputLeftAddon>}
        <ChakraInput
          value={value ?? ""}
          isDisabled={disabled}
          onChange={handleChange}
          focusBorderColor={themeColorHex}
          _hover={{}}
          background={darkerBgColor}
          borderColor="#CCCCCC"
        />
      </InputGroup>
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
