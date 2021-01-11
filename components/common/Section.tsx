import { Box, BoxProps } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";

const Section: React.FC<BoxProps> = (props) => {
  const { secondaryBgColor } = useMyTheme();
  return (
    <Box
      as="section"
      bg={secondaryBgColor}
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="1.5rem"
      rounded="lg"
      {...props}
    />
  );
};

export default Section;
