/*
  const theme = {
    light: {
      colorMode: "light",
      bgColor: "#eff0f3",
      darkerBgColor: "#FFFAFA",
      textColor: "blackAlpha.900",
      borderStyle: "1px solid rgba(0, 0, 0, .2)",
      themeColorWithShade: `${themeColor}.500`,
      grayWithShade: "gray.600",
      themeColorHex: chakraTheme.colors[themeColor]["500"],
      themeColorHexLighter: chakraTheme.colors[themeColor]["200"],
      themeColor,
    } as Theme,
    dark: {
      colorMode: "dark",
      bgColor: "#031e3e",
      darkerBgColor: "#0e2a56",
      textColor: "whiteAlpha.900",
      borderStyle: "1px solid rgba(255, 255, 255, .2)",
      themeColorWithShade: `${themeColor}.200`,
      grayWithShade: "gray.300",
      themeColorHex: chakraTheme.colors[themeColor]["500"],
      themeColorHexLighter: chakraTheme.colors[themeColor]["200"],
      themeColor,
    } as Theme,
  }; */

export const theme = {
  light: {
    themeColorShade: "theme.600",
    themeColorHex: "#79ff61", // light lime green
    bgColor: "#eff0f3",
    secondaryBgColor: "#FFFAFA",
    textColor: "blackAlpha.900",
    gray: "gray.600",
  },
  dark: {
    themeColorShade: "theme.200",
    themeColorHex: "#79ff61", // light lime green
    bgColor: "#031e3e",
    secondaryBgColor: "#0e2a56",
    textColor: "whiteAlpha.900",
    gray: "gray.300",
  },
} as const;
