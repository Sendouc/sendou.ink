import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import { SWRConfig } from "swr";
import Banner from "./Banner";
import Footer from "./Footer";
import { LanguageSelector } from "./LanguageSelector";

const DATE_KEYS = ["createdAt", "updatedAt"];

const WIDE = [
  "analyzer",
  "plans",
  "builds",
  "u/",
  "sr/leaderboards",
  "plus/history",
];

const navIcons: {
  code: string;
  displayName: string;
  menuItems: (
    | {
        code: string;
        displayName: string;
      }
    | { component: React.ReactNode; code: string }
  )[];
}[] = [
  // {
  //   code: "xsearch",
  //   displayName: t`Top 500`,
  //   menuItems: [
  //     { code: "xsearch", displayName: t`Browser` },
  //     { code: "xtrends", displayName: t`Tier Lists` },
  //   ],
  // },
  // {
  //   code: "leaderboards",
  //   displayName: t`Leaderboards`,
  //   menuItems: [],
  // },
  { code: "xsearch", displayName: t`Browser`, menuItems: [] },
  { code: "xsearch", displayName: t`Tier Lists`, menuItems: [] },
  {
    code: "sr",
    displayName: "Salmon Run",
    menuItems: [
      { code: "sr/leaderboards", displayName: t`Leaderboards` },
      { code: "sr/guide/fundamentals", displayName: t`Guide (Fundamentals)` },
      { code: "sr/guide/advanced", displayName: t`Guide (Advanced)` },
      {
        component: (
          <a href="https://discord.gg/pXHRffE">
            <Flex ml="-9px" justify="center">
              <Flex mr={1} align="center">
                <Image
                  className="rounded"
                  src="/layout/overfishing_logo.png"
                  width={20}
                  height={20}
                />
              </Flex>
              Overfishing Discord
            </Flex>
          </a>
        ),
        code: "overfishing",
      },
    ],
  },
  {
    code: "builds",
    displayName: t`Builds`,
    menuItems: [],
  },
  { code: "analyzer", displayName: t`Analyzer`, menuItems: [] },
  { code: "calendar", displayName: t`Calendar`, menuItems: [] },
  { code: "u", displayName: t`Users`, menuItems: [] },
  { code: "freeagents", displayName: t`Free Agents`, menuItems: [] },
  { code: "t", displayName: t`Teams`, menuItems: [] },
  { code: "plans", displayName: t`Plans`, menuItems: [] },
  { code: "plans", displayName: t`Map Lists`, menuItems: [] },
  // {
  //   code: "plans",
  //   displayName: t`Maps`,
  //   menuItems: [
  //     {
  //       code: "plans",
  //       displayName: t`Map Planner`,
  //     },
  //     {
  //       code: "maps",
  //       displayName: t`Maplist Generator`,
  //     },
  //   ],
  // },
  // { code: "tournaments", displayName: t`Tournaments`, menuItems: [] },
  {
    code: "plus",
    displayName: t`Plus Server`,
    menuItems: [],
  },
  { code: "links", displayName: t`Links`, menuItems: [] },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { secondaryBgColor } = useMyTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const [errors, setErrors] = useState(new Set<string>());
  const toast = useToast();

  const isWide = WIDE.some((widePage) =>
    router.pathname.startsWith("/" + widePage)
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
      {/* <TopNav />
      <IconNavBar /> */}
      <Banner />
      <Flex>
        <Box
          m={4}
          width="12rem"
          top={4}
          height="100vh"
          position="sticky"
          alignSelf="flex-start"
          display={["none", null, "block"]}
        >
          <Flex
            justifySelf="center"
            color="gray.600"
            fontWeight="bold"
            letterSpacing={1}
            justify="center"
            align="flex-start"
            mb={1}
          >
            {" "}
            <Link href="/">sendou.ink</Link>
          </Flex>
          <Flex justifyContent="space-evenly" mb={2}>
            <IconButton
              data-cy="color-mode-toggle"
              aria-label={`Switch to ${
                colorMode === "light" ? "dark" : "light"
              } mode`}
              variant="ghost"
              color="current"
              fontSize="20px"
              onClick={toggleColorMode}
              icon={colorMode === "light" ? <FiSun /> : <FiMoon />}
              mr="5px"
              isRound
            />
            <LanguageSelector />
          </Flex>
          {navIcons.map((icon) => (
            <MyLink
              key={icon.code}
              href={"/" + icon.code}
              isColored={false}
              noUnderline
            >
              <Flex
                width="100%"
                rounded="lg"
                p={2}
                fontSize="sm"
                fontWeight="bold"
                align="center"
                whiteSpace="nowrap"
                _hover={{
                  bg: secondaryBgColor,
                }}
              >
                <Image
                  src={`/layout/${icon.code}.png`}
                  height={32}
                  width={32}
                  priority
                />
                <Box ml={2}>{icon.displayName}</Box>
              </Flex>
            </MyLink>
          ))}

          <Center mt={6}>
            <a href="https://patreon.com/sendou">
              <Button
                size="xs"
                bg={colorMode === "dark" ? "white" : "black"}
                leftIcon={<FaHeart />}
              >
                Sponsor
              </Button>
            </a>
          </Center>
        </Box>
        {/* <Flex flexDirection="column" minH="100vh" flexGrow={1} pt={4}>
          <MyContainer wide={isWide}>{children}</MyContainer>
        </Flex>
        <Box width="12rem" mr={4} mt={4}>
          <Button size="sm">New event</Button>
          <Input mt={2} />
        </Box> */}
        {children}
      </Flex>
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
