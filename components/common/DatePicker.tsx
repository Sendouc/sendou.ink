import { Box, useColorMode } from "@chakra-ui/react";
import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  isClearable?: boolean;
  onChange: (date: Date) => any;
  selectedDate: Date | undefined;
}

const DatePicker = ({ selectedDate, onChange, isClearable = false }: Props) => {
  const { colorMode } = useColorMode();
  return (
    <Box className={colorMode + "-datepicker"}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={onChange}
        isClearable={isClearable}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
      />
    </Box>
  );
};

export default DatePicker;
