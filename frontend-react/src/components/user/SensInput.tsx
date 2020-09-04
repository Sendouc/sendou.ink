import React from "react"
import {
  NumberInput as ChakraNumberInput,
  NumberInputStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
} from "@chakra-ui/core"
import Label from "../elements/Label"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

interface MotionInputProps {
  label: string
  value?: number
  onChange: (value: number) => void
}

const MotionInput: React.FC<MotionInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const { themeColorHex, darkerBgColor } = useContext(MyThemeContext)
  return (
    <Box>
      <Label>{label}</Label>
      <ChakraNumberInput
        value={value}
        onChange={(value) => {
          const parsed = parseFloat(value.toString())
          if (
            [
              -5,
              -4.5,
              -4,
              -3.5,
              -3,
              -2.5,
              -2,
              -1.5,
              -1,
              -0.5,
              0,
              0.5,
              1,
              1.5,
              2,
              2.5,
              3,
              3.5,
              4,
              4.5,
              5,
            ].indexOf(parsed) !== -1
          ) {
            onChange(parsed)
          }
        }}
        size="lg"
        min={-5}
        max={5}
        step={0.5}
      >
        <NumberInputField type="number" background={darkerBgColor} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </ChakraNumberInput>
    </Box>
  )
}

export default MotionInput
