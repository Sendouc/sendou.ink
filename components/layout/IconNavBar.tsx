import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useMyTheme } from "hooks/common";
import { useRouter } from "next/dist/client/router";
import Image from "next/image";
import Link from "next/link";

export const navIcons: {
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
  {
    code: "xsearch",
    displayName: t`Top 500`,
    menuItems: [
      { code: "xsearch", displayName: t`Browser` },
      { code: "xtrends", displayName: t`Tier Lists` },
    ],
  },
  // {
  //   code: "leaderboards",
  //   displayName: t`Leaderboards`,
  //   menuItems: [],
  // },
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
  { code: "analyzer", displayName: t`Build Analyzer`, menuItems: [] },
  // { code: "calendar", displayName: t`Calendar`, menuItems: [] },
  { code: "u", displayName: t`User Search`, menuItems: [] },
  { code: "freeagents", displayName: t`Free Agents`, menuItems: [] },
  { code: "t", displayName: t`Teams`, menuItems: [] },
  {
    code: "plans",
    displayName: t`Maps`,
    menuItems: [
      {
        code: "plans",
        displayName: t`Map Planner`,
      },
      {
        code: "maps",
        displayName: t`Maplist Generator`,
      },
    ],
  },
  // { code: "tournaments", displayName: t`Tournaments`, menuItems: [] },
  {
    code: "plus",
    displayName: t`Plus Server`,
    menuItems: [],
  },
  { code: "links", displayName: t`External links`, menuItems: [] },
];

const IconNavBar = () => {
  const { i18n } = useLingui();
  const {
    secondaryBgColor,
    textColor,
    themeColorHex: themeColor,
  } = useMyTheme();
  const pathname = useRouter().pathname;

  return (
    <Flex
      as="nav"
      bg={secondaryBgColor}
      justifyContent="center"
      flexWrap="wrap"
      boxShadow="lg"
    >
      {navIcons.map(({ displayName, code, menuItems }) => {
        if (!menuItems.length) {
          return (
            <Link key={code} href={"/" + code}>
              <a>
                <MenuDialog displayName={i18n._(displayName)}>
                  <MenuNavIcon code={code} />
                </MenuDialog>
              </a>
            </Link>
          );
        }

        return (
          <Menu key={code}>
            <Box m="5px 15px">
              <MenuButton>
                <MenuNavIcon code={code} showDownArrow />
              </MenuButton>
            </Box>
            <MenuList bg={secondaryBgColor} color={textColor}>
              <MenuGroup title={i18n._(displayName)}>
                {menuItems.map((item) => {
                  if ("component" in item)
                    return (
                      <MenuItem key={item.code}>{item.component}</MenuItem>
                    );
                  return (
                    <Link key={item.code} href={"/" + item.code}>
                      <a>
                        <MenuItem>
                          {pathname === "/" + item.code ? (
                            <Box
                              h="7px"
                              w="7px"
                              mb={1}
                              bgColor={themeColor}
                              borderRadius="50%"
                              lineHeight="0.5rem"
                              mr="7px"
                              mt="4px"
                            />
                          ) : (
                            <Box
                              h="7px"
                              w="7px"
                              mb={1}
                              borderRadius="50%"
                              lineHeight="0.5rem"
                              mr="7px"
                              mt="4px"
                              opacity={1}
                            />
                          )}
                          <Box>
                            <Trans id={item.displayName} />
                          </Box>
                        </MenuItem>
                      </a>
                    </Link>
                  );
                })}
              </MenuGroup>
            </MenuList>
          </Menu>
        );
      })}
    </Flex>
  );

  function MenuNavIcon({
    code,
    showDownArrow,
  }: {
    code: string;
    showDownArrow?: boolean;
  }) {
    return (
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        m="5px 15px"
        mx="-0.2rem"
      >
        <Image
          src={`/layout/${code}.png`}
          height={48}
          width={48}
          alt={code}
          priority
          // TODO when chakra-ui adds next/image support
          // @ts-ignore
          style={{ cursor: "pointer" }}
        />
        {showDownArrow && (
          <Box ml="0.1rem" lineHeight="0.5rem">
            ▾
          </Box>
        )}
      </Flex>
    );
  }

  function MenuDialog({
    children,
    displayName,
  }: {
    children: React.ReactNode;
    displayName: string;
  }) {
    return (
      <Popover trigger="hover" variant="responsive">
        <PopoverTrigger>
          <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            m="5px 15px"
          >
            {children}
          </Flex>
        </PopoverTrigger>
        <PopoverContent bg={secondaryBgColor}>
          <PopoverHeader fontWeight="semibold">{displayName}</PopoverHeader>
          <PopoverArrow bg={secondaryBgColor} />
        </PopoverContent>
      </Popover>
    );
  }
};

export default IconNavBar;
