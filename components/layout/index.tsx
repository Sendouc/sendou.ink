import { Container, Flex, useToast } from "@chakra-ui/core";
import { t } from "@lingui/macro";
import { getToastOptions } from "lib/getToastOptions";
import { AppProps } from "next/app";
import { useRouter } from "next/dist/client/router";
import { SWRConfig } from "swr";
import Footer from "./Footer";
import IconNavBar from "./IconNavBar";
import TopNav from "./TopNav";

const PAGES_WITH_WIDE_CONTAINER = [
  "/analyzer",
  "/xsearch",
  "/builds",
  "/plans",
  "/xleaderboards",
];

const Layout = ({ Component, pageProps }: AppProps) => {
  const toast = useToast();
  const pathname = useRouter().pathname;

  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onError: (error) => {
          toast(
            getToastOptions(error.message ?? t`An error occurred`, "error")
          );
        },
      }}
    >
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
    </SWRConfig>
  );
};

export default Layout;
