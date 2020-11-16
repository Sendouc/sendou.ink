import { useColorMode } from "@chakra-ui/react";
import { theme } from "theme";

// This hook can be deprecated
export const useMyTheme = () => {
  const { colorMode } = useColorMode();

  return theme[colorMode];
};
