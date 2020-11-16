import {
    Box,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import React, { useContext } from "react";
import MyThemeContext from "../../themeContext";
import Label from "../elements/Label";

interface MotionInputProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;
}

const MotionInput: React.FC<MotionInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const { darkerBgColor } = useContext(MyThemeContext);
  return (
    <Box>
      <Label>{label}</Label>
      <NumberInput
        value={value ?? undefined}
        onChange={(_, value) => onChange(Math.round(value * 2) / 2)}
        size="lg"
        min={-5}
        max={5}
        step={0.5}
      >
        <NumberInputField background={darkerBgColor} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Box>
  );
};

export default MotionInput;
