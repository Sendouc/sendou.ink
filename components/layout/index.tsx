import { Container, Flex, useToast } from "@chakra-ui/react";
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

function reviver(key: any, value: any) {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (entry.updatedAt)
        return { ...entry, updatedAt: new Date(entry.updatedAt) };

      return entry;
    });
  }

  if (key === "updatedAt") return new Date(value);

  return value;
}

const Layout = ({ Component, pageProps }: AppProps) => {
  const toast = useToast();
  const pathname = useRouter().pathname;

  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then(async (res) => {
            let data = await res.text();

            return JSON.parse(data, reviver);
          }),
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
