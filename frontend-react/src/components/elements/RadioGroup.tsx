import React, { useContext } from "react"
import { RadioGroup as ChakraRadioGroup, Radio, Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface RadioGroupProps {
  options: { label: string; value: string }[]
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
        onChange={(e) => setValue(e.target.value)}
        value={value}
      >
        {options.map(({ label, value: valueOfOption }) => (
          <Radio
            key={valueOfOption}
            variantColor={themeColor}
            value={valueOfOption}
            isChecked={valueOfOption === value}
          >
            {label}
          </Radio>
        ))}
      </ChakraRadioGroup>
    </>
  )
}

export default RadioGroup
