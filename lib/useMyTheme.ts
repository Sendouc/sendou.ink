import { useColorMode } from "@chakra-ui/core";
import { theme } from "theme";

export const useMyTheme = () => {
  const { colorMode } = useColorMode();

  return theme[colorMode];
};
