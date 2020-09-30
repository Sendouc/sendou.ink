import React, { useContext } from "react";
import { Textarea, Box } from "@chakra-ui/core";
import Label from "./Label";
import MyThemeContext from "../../themeContext";

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
  const { themeColorHex, grayWithShade, darkerBgColor } = useContext(
    MyThemeContext
  );

  return (
    <>
      {label && <Label required={required}>{label}</Label>}
      <Textarea
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
        focusBorderColor={themeColorHex}
        size="md"
        height={height}
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
  );
};

export default TextArea;
