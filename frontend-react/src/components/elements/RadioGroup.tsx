import React, { useContext } from "react"
import { RadioGroup as ChakraRadioGroup, Radio } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import Box from "./Box"

interface RadioGroupProps {
  options: string[]
  value: string
  label?: string
  setValue: (value: any) => void
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  setValue,
  options,
  label,
}) => {
  const { themeColor } = useContext(MyThemeContext)
  return (
    <>
      {label && (
        <Box mb="0.2em">
          <b>{label}</b>
        </Box>
      )}
      <ChakraRadioGroup
        spacing={5}
        isInline
        onChange={e => setValue(e.target.value)}
        value={value}
      >
        {options.map(option => (
          <Radio
            key={option}
            variantColor={themeColor}
            value={option}
            isChecked={value === option}
          >
            {option}
          </Radio>
        ))}
      </ChakraRadioGroup>
    </>
  )
}

export default RadioGroup
