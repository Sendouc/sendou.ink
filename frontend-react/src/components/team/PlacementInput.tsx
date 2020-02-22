import React, { useContext, ReactText } from "react"
import Label from "../elements/Label"
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface PlacementInputProps {
  value?: number
  onChange: (value: number) => void
}

const PlacementInput: React.FC<PlacementInputProps> = ({ value, onChange }) => {
  const { themeColorHex } = useContext(MyThemeContext)
  return (
    <>
      <Label>Placement</Label>
      <NumberInput
        size="lg"
        defaultValue={1}
        min={1}
        max={500}
        value={value}
        onChange={(value: ReactText) => onChange(value as number)}
      >
        <NumberInputField focusBorderColor={themeColorHex} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </>
  )
}

export default PlacementInput
