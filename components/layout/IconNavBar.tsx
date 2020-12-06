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
import { useMyTheme } from "lib/useMyTheme";
import { useRouter } from "next/dist/client/router";
import Image from "next/image";
import Link from "next/link";

export const navIcons: {
  code: string;
  displayName: string;
  menuItems: {
    code: string;
    displayName: string;
    toAppend?: string;
  }[];
}[] = [
  {
    code: "xsearch",
    displayName: t`Top 500`,
    menuItems: [
      { code: "xsearch", displayName: t`Browser` },
      { code: "xleaderboards", displayName: t`Leaderboards` },
    ],
  },
  //{ code: "sr", displayName: "Salmon Run", menuItems: [] },
  {
    code: "builds",
    displayName: t`Builds`,
    menuItems: [
      { code: "builds", displayName: t`Browser` },
      { code: "analyzer", displayName: t`Analyzer` },
    ],
  },
  { code: "calendar", displayName: t`Calendar`, menuItems: [] },
  { code: "u", displayName: t`User Search`, menuItems: [] },
  { code: "freeagents", displayName: t`Free Agents`, menuItems: [] },
  //{ name: "teams", displayName: "Teams" },
  { code: "plans", displayName: t`Map Planner`, menuItems: [] },
  { code: "tournaments", displayName: t`Tournaments`, menuItems: [] },
  {
    code: "plus",
    displayName: t`Plus Server`,
    menuItems: [
      {
        code: "plus/voting",
        displayName: t`Voting`,
        toAppend:
          ": " +
          getFirstFridayDate().toLocaleString("default", {
            month: "short",
            day: "numeric",
          }),
      },
      { code: "plus", displayName: t`Suggested and vouched players` },
      { code: "plus/history", displayName: t`Voting history` },
      { code: "draft", displayName: t`Draft Cup` },
      { code: "plus/faq", displayName: t`FAQ` },
    ],
  },
];

const IconNavBar = () => {
  const { i18n } = useLingui();
  const {
    secondaryBgColor,
    textColor,
    themeColorHex: themeColor,
  } = useMyTheme();
  const pathname = useRouter().pathname;

  //const isVoting = !!plusInfoData?.plusInfo?.voting_ends;
  const isVoting = false;

  return (
    <Flex
      as="nav"
      bg={secondaryBgColor}
      py={2}
      justifyContent="center"
      flexWrap="wrap"
      boxShadow="md"
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
            <MenuDialog displayName={i18n._(displayName)}>
              <MenuButton>
                <MenuNavIcon code={code} showDownArrow />
              </MenuButton>
            </MenuDialog>
            <MenuList bg={secondaryBgColor} color={textColor}>
              <MenuGroup title={i18n._(displayName)}>
                {menuItems.map((item) => (
                  <Link key={item.code} href={"/" + item.code}>
                    <a>
                      <MenuItem
                        disabled={item.displayName === "Voting" && !isVoting}
                      >
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
                ))}
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

function getFirstFridayDate() {
  const today = new Date();
  const month =
    today.getDate() - ((1 + today.getDay()) % 7) <= 0
      ? today.getMonth()
      : today.getMonth() + 1;

  let day = 1;
  while (day <= 7) {
    const dateOfVoting = new Date(
      Date.UTC(today.getFullYear(), month, day, 15, 0, 0)
    );

    if (dateOfVoting.getDay() === 5) return dateOfVoting;

    day++;
  }

  console.error("Couldn't resolve first friday of the month for voting");
  return new Date(2000, 1, 1);
}

export default IconNavBar;
