import React, { useContext } from "react"
import {
  Input as ChakraInput,
  InputGroup,
  InputLeftAddon,
  Box,
  InputLeftElement,
  Icon,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import Label from "./Label"
import { IconType } from "react-icons/lib/cjs"

interface InputProps {
  value?: string
  setValue: (value: string) => void
  label: string
  limit?: number
  required?: boolean
  disabled?: boolean
  textLeft?: string
  size?: "sm" | "md" | "lg"
  icon?: IconType
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
  icon,
}) => {
  const { themeColorHex, grayWithShade, darkerBgColor, textColor } = useContext(
    MyThemeContext
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  return (
    <Box>
      {label && <Label required={required}>{label}</Label>}
      <InputGroup>
        {textLeft && <InputLeftAddon>{textLeft}</InputLeftAddon>}
        <InputLeftElement children={<Box as={icon} color={textColor} />} />
        {icon && <InputLeftElement color="white" children={icon} />}
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
