import { Flex, useToast } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import MyContainer from "components/common/MyContainer";
import { useMyTheme } from "hooks/common";
import { useState } from "react";
import { SWRConfig } from "swr";
import Banner from "./Banner";
import Footer from "./Footer";
import IconNavBar from "./IconNavBar";
import TopNav from "./TopNav";

const DATE_KEYS = ["createdAt", "updatedAt"];

const WIDE = [
  "analyzer",
  "plans",
  "builds",
  "u/",
  "sr/leaderboards",
  "plus/history",
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { secondaryBgColor } = useMyTheme();
  const [errors, setErrors] = useState(new Set<string>());
  const toast = useToast();

  const isWide =
    window &&
    WIDE.some((widePage) =>
      window.location.pathname.startsWith("/" + widePage)
    );

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
      <MyContainer p={0}>
        <TopNav />
        <IconNavBar />
        <Banner />
      </MyContainer>
      <Flex flexDirection="column" minH="100vh" pt={4}>
        <MyContainer
          wide={isWide}
          bg={secondaryBgColor}
          rounded="md"
          py={5}
          px={7}
          boxShadow="lg"
          minH="24rem"
        >
          {children}
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
