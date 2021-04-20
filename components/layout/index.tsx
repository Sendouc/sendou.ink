import { useToast } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useRouter } from "next/router";
import { useState } from "react";
import { SWRConfig } from "swr";
import Footer from "./Footer";
import Header from "./Header";
import MobileNav from "./MobileNav";
import Nav from "./Nav";

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
  const [navIsOpen, setNavIsOpen] = useState(false);
  const router = useRouter();
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
          console.error(key + ": " + _);
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
      <Header openNav={() => setNavIsOpen(true)} />
      <Nav />
      <MobileNav isOpen={navIsOpen} onClose={() => setNavIsOpen(false)} />
      <main>{children}</main>
      <Footer />
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
