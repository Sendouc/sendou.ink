import { Box, BoxProps } from "@chakra-ui/react";
import React, { useContext } from "react";
import MyThemeContext from "../../themeContext";

interface SectionProps {
  children: React.ReactNode;
}

const Section: React.FC<SectionProps & BoxProps> = ({ children, ...props }) => {
  const { darkerBgColor } = useContext(MyThemeContext);
  return (
    <Box
      bg={darkerBgColor}
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="1.5rem"
      rounded="lg"
      {...props}
    >
      {children}
    </Box>
  );
};

export default Section;
