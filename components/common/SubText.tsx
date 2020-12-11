import { Box, BoxProps } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";

interface Props {
  children: React.ReactNode;
}

const SubText: React.FC<Props & BoxProps> = ({ children, ...props }) => {
  const { themeColorShade } = useMyTheme();
  return (
    <Box
      fontSize="xs"
      textColor={themeColorShade}
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
