import {
  Box,
  Container,
  Flex,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { AppProps } from "next/app";
import { SWRConfig } from "swr";
import Footer from "./Footer";
import IconNavBar from "./IconNavBar";
import TopNav from "./TopNav";

const Layout = ({ Component, pageProps }: AppProps) => {
  const toast = useToast();
  const bannerColor = useColorModeValue("lightblue", "black");

  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then(async (res) => {
            const data = await res.text();

            return JSON.parse(data, reviver);
          }),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onError: () => {
          toast({
            duration: null,
            isClosable: true,
            position: "top-right",
            status: "error",
            description: t`An error occurred`,
          });
        },
      }}
    >
      <TopNav />
      <IconNavBar />
      {process.env.NODE_ENV !== "production" && (
        <Box bg={bannerColor} p={2} textAlign="center">
          This is the preview version.{" "}
          <span style={{ color: "red" }}>Database will be reset</span>. For
          anything other than testing please go to:{" "}
          <a href="https://sendou.ink">https://sendou.ink</a>
        </Box>
      )}
      <Flex flexDirection="column" minH="100vh" pt="1rem">
        <Container maxWidth="100ch">
          <Component {...pageProps} />
        </Container>
        <Footer />
      </Flex>
    </SWRConfig>
  );
};

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

export default Layout;
