import { Box, Textarea } from "@chakra-ui/react";
import React, { useContext } from "react";
import MyThemeContext from "../../themeContext";
import Label from "./Label";

interface TextAreaProps {
  value?: string;
  setValue: (value: string) => void;
  label?: string;
  limit?: number;
  required?: boolean;
  height?: string;
  id?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  setValue,
  label,
  limit,
  required,
  height,
}) => {
  const { themeColorWithShade, grayWithShade, darkerBgColor } = useContext(
    MyThemeContext
  );

  return (
    <>
      {label && <Label required={required}>{label}</Label>}
      <Textarea
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
        _focus={{ border: "1px solid", borderColor: themeColorWithShade }}
        size="md"
        height={height}
        _hover={{}}
        background={darkerBgColor}
        borderColor={darkerBgColor}
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
  );
};

export default TextArea;
