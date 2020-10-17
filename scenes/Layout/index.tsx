import { Container, Flex } from "@chakra-ui/core";
import { AppProps } from "next/app";
import { useRouter } from "next/dist/client/router";
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
  const pathname = useRouter().pathname;

  return (
    <>
      <TopNav />
      <IconNavBar />
      <Flex flexDirection="column" minH="100vh" pt="1rem">
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
