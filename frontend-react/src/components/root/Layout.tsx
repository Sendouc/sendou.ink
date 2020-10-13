import {
  Container,
  Flex,
  theme as chakraTheme,
  useColorMode,
} from "@chakra-ui/core";
import { useLocation } from "@reach/router";
import useLocalStorage from "@rehooks/local-storage";
import React, { Suspense, useEffect } from "react";
import { MyThemeProvider } from "../../themeContext";
import { Theme, ThemeColor } from "../../types";
import Footer from "./Footer";
import IconNavBar from "./IconNavBar";
import TopNav from "./TopNav";

interface LayoutProps {
  children: React.ReactNode;
}

const PAGES_WITH_WIDE_CONTAINER = [
  "/analyzer",
  "/xsearch",
  "/builds",
  "/plans",
  "/xleaderboards",
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode } = useColorMode();
  const [themeColorFromStorage] = useLocalStorage<ThemeColor>(
    "colorPreference"
  );
  const location = useLocation();

  const themeColor = themeColorFromStorage
    ? themeColorFromStorage
    : colorMode === "light"
    ? "pink"
    : "orange";

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
  };

  useEffect(() => {
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    if (!favicon) return;
    favicon.href = `/favicon_${themeColor}.png`;
  }, [themeColorFromStorage, themeColor]);

  useEffect(() => {
    document.body.style.backgroundColor = theme[colorMode].bgColor;
  }, [colorMode]);

  return (
    <>
      <MyThemeProvider value={theme[colorMode]}>
        <TopNav />
        <Suspense fallback={null}>
          <IconNavBar />
        </Suspense>
        <Flex
          flexDirection="column"
          color={theme[colorMode].textColor}
          minH="100vh"
          pt="1rem"
        >
          <Container
            maxWidth={
              PAGES_WITH_WIDE_CONTAINER.includes(location.pathname)
                ? "120ch"
                : "70ch"
            }
          >
            {children}
          </Container>
          <Footer />
        </Flex>
      </MyThemeProvider>
    </>
  );
};

export default Layout;
