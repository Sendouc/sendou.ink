import { extendTheme, useColorMode } from "@chakra-ui/core";
import useLocalStorage from "@rehooks/local-storage";
import { ThemeColor } from "../types";

export function useTheme(): Parameters<typeof extendTheme>[0] {
  const { colorMode } = useColorMode()
  const defaultThemeColor = colorMode === "light"
    ? "pink"
    : "orange";
  const [themeColor = defaultThemeColor] = useLocalStorage<ThemeColor>(
    "colorPreference"
  );
  return {
    components: {
      /*Input: {
        baseStyle: {
          field: {
            bgColor: "black",
            width: "50%"
          }
        }
      },*/
      Button: {
        defaultProps: {
          colorScheme: themeColor
        }
      }
    },
    config: { useSystemColorMode: true }
  } as const
}