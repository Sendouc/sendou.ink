import { Container, Flex } from "@chakra-ui/core";
import { useMyTheme } from "lib/useMyTheme";
import { AppProps } from "next/app";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";
import Footer from "./components/Footer";
import IconNavBar from "./components/IconNavBar";
import TopNav from "./components/TopNav";

const PAGES_WITH_WIDE_CONTAINER = [
  "/analyzer",
  "/xsearch",
  "/builds",
  "/plans",
  "/xleaderboards",
];

const Layout = ({ Component, pageProps }: AppProps) => {
  const { bgColor, textColor } = useMyTheme();
  const pathname = useRouter().pathname;

  // FIXME
  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
  }, [bgColor]);

  return (
    <>
      <TopNav />
      <IconNavBar />
      <Flex flexDirection="column" color={textColor} minH="100vh" pt="1rem">
        <Container
          maxWidth={
            PAGES_WITH_WIDE_CONTAINER.includes(pathname) ? "120ch" : "70ch"
          }
        >
          <Component {...pageProps} />
        </Container>
        <Footer />
      </Flex>
    </>
  );
};

export default Layout;
