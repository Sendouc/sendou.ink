import { Container, Flex } from "@chakra-ui/core";
import { useLocation } from "@reach/router";
import React, { Suspense, useContext, useEffect } from "react";
import MyThemeContext from "../../themeContext";
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
  const { bgColor, textColor } = useContext(MyThemeContext);
  const location = useLocation();

  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
  }, [bgColor]);

  return (
    <>
      <TopNav />
      <Suspense fallback={null}>
        <IconNavBar />
      </Suspense>
      <Flex flexDirection="column" color={textColor} minH="100vh" pt="1rem">
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
    </>
  );
};

export default Layout;
