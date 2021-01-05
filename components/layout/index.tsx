import { Flex, useToast } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import MyContainer from "components/common/MyContainer";
import { AppProps } from "next/app";
import { useState } from "react";
import { SWRConfig } from "swr";
import Banner from "./Banner";
import Footer from "./Footer";
import IconNavBar from "./IconNavBar";
import TopNav from "./TopNav";

const DATE_KEYS = ["createdAt", "updatedAt"];

const Layout = ({ Component, pageProps }: AppProps) => {
  const [errors, setErrors] = useState(new Set<string>());
  const toast = useToast();

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
        onError: (_, key) => {
          if (errors.has(key)) return;
          setErrors(new Set([...errors, key]));
          toast({
            duration: null,
            isClosable: true,
            position: "top-right",
            status: "error",
            description: t`An error occurred`,
            onCloseComplete: () =>
              setErrors(
                new Set(Array.from(errors).filter((error) => error !== key))
              ),
          });
        },
      }}
    >
      <TopNav />
      <IconNavBar />
      <Banner />
      <Flex flexDirection="column" minH="100vh" pt="1rem">
        <MyContainer wide>
          <Component {...pageProps} />
        </MyContainer>
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

  if (DATE_KEYS.includes(key)) return new Date(value);

  return value;
}

export default Layout;
