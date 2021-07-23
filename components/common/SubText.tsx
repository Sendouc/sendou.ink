import { Box, BoxProps } from "@chakra-ui/react";
import { CSSVariables } from "utils/CSSVariables";

interface Props {
  children: React.ReactNode;
}

const SubText: React.FC<Props & BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      fontSize="xs"
      textColor={CSSVariables.themeColor}
      textTransform="uppercase"
      letterSpacing="wider"
      lineHeight="1rem"
      fontWeight="medium"
      {...props}
    >
      {children}
    </Box>
  );
};

export default SubText;
