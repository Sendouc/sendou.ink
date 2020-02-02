import React, { useContext } from "react"
import { Input as ChakraInput } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface InputProps {
  value?: string
  setValue: (value: string) => void
  placeholder: string
}

const Input: React.FC<InputProps> = ({ value, placeholder, setValue }) => {
  const { themeColorHex } = useContext(MyThemeContext)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  return (
    <ChakraInput
      value={value ?? ""}
      onChange={handleChange}
      placeholder={placeholder}
      focusBorderColor={themeColorHex}
    />
  )
}

export default Input
