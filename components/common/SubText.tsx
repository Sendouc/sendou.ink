import { Box } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";

interface Props {
  children: React.ReactNode;
}

const SubText: React.FC<Props> = ({ children }) => {
  const { themeColorShade } = useMyTheme();
  return (
    <Box
      fontSize="xs"
      textColor={themeColorShade}
      textTransform="uppercase"
      letterSpacing="wider"
      lineHeight="1rem"
      fontWeight="medium"
    >
      {children}
    </Box>
  );
};

export default SubText;
