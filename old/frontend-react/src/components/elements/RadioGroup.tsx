import React, { useContext } from "react";
import {
  RadioGroup as ChakraRadioGroup,
  Radio,
  Box,
  Stack,
} from "@chakra-ui/core";
import MyThemeContext from "../../themeContext";

interface RadioGroupProps {
  options: { label: string; value: string }[];
  value: string;
  label?: string;
  setValue: (value: any) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  setValue,
  options,
  label,
}) => {
  const { themeColor } = useContext(MyThemeContext);
  return (
    <>
      {label && (
        <Box mb="0.2em">
          <b>{label}</b>
        </Box>
      )}
      <ChakraRadioGroup onChange={setValue} value={value}>
        <Stack direction="row">
          {options.map(({ label, value: valueOfOption }) => (
            <Radio
              key={valueOfOption}
              colorScheme={themeColor}
              value={valueOfOption}
              isChecked={valueOfOption === value}
            >
              {label}
            </Radio>
          ))}
        </Stack>
      </ChakraRadioGroup>
    </>
  );
};

export default RadioGroup;
