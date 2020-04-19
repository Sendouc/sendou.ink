import React, { useContext } from "react"
import {
  Input as ChakraInput,
  InputGroup,
  InputLeftAddon,
  Box,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import Label from "./Label"

interface InputProps {
  value?: string
  setValue: (value: string) => void
  label: string
  limit?: number
  required?: boolean
  disabled?: boolean
  textLeft?: string
  size?: "sm" | "md" | "lg"
}

const Input: React.FC<InputProps> = ({
  value,
  setValue,
  label,
  required,
  disabled,
  limit,
  textLeft,
  size,
}) => {
  const { themeColorHex, grayWithShade, darkerBgColor } = useContext(
    MyThemeContext
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  return (
    <Box>
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
          size={size}
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
    </Box>
  )
}

export default Input
