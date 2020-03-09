import React, { useContext } from "react"
import { Textarea } from "@chakra-ui/core"
import Label from "./Label"
import Box from "./Box"
import MyThemeContext from "../../themeContext"

interface TextAreaProps {
  value?: string
  setValue: (value: string) => void
  label?: string
  limit?: number
  required?: boolean
  id?: string
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  setValue,
  label,
  limit,
  required,
}) => {
  const { themeColorHex, grayWithShade, darkerBgColor } = useContext(
    MyThemeContext
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  return (
    <>
      {label && <Label required={required}>{label}</Label>}
      <Textarea
        value={value ?? ""}
        onChange={handleChange}
        focusBorderColor={themeColorHex}
        size="md"
        _hover={{}}
        background={darkerBgColor}
        borderColor="#CCCCCC"
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

export default TextArea
