import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/core";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import { useRouter } from "next/dist/client/router";
import Image from "next/image";
import Link from "next/link";

// FIXME: " Warning: Text content did not match. Server: ": Nov 6" Client: ": 6 Nov" "
const getFirstFridayDate = () => {
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
};

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
    displayName: "Top 500",
    menuItems: [
      { code: "xsearch", displayName: "Browser" },
      { code: "xtrends", displayName: "Trends" },
      { code: "xleaderboards", displayName: "Leaderboards" },
    ],
  },
  //{ code: "sr", displayName: "Salmon Run", menuItems: [] },
  {
    code: "builds",
    displayName: "Builds",
    menuItems: [
      { code: "builds", displayName: "Browser" },
      { code: "analyzer", displayName: "Analyzer" },
    ],
  },
  { code: "calendar", displayName: "Calendar", menuItems: [] },
  { code: "freeagents", displayName: "Free Agents", menuItems: [] },
  //{ name: "teams", displayName: "Teams" },
  { code: "plans", displayName: "Map Planner", menuItems: [] },
  { code: "tournaments", displayName: "Tournaments", menuItems: [] },
  {
    code: "plus",
    displayName: "Plus Server",
    menuItems: [
      {
        code: "plus/voting",
        displayName: "Voting",
        toAppend:
          ": " +
          getFirstFridayDate().toLocaleString("default", {
            month: "short",
            day: "numeric",
          }),
      },
      { code: "plus", displayName: "Suggested and vouched players" },
      { code: "plus/history", displayName: "Voting history" },
      { code: "draft", displayName: "Draft Cup" },
      { code: "plus/faq", displayName: "FAQ" },
    ],
  },
];

const IconNavBar = () => {
  const { t } = useTranslation();
  const {
    secondaryBgColor,
    textColor,
    themeColorHex: themeColor,
    gray,
  } = useMyTheme();
  const pathname = useRouter().pathname;

  // FIXME
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
        const codesTogether =
          "/" +
          code +
          menuItems.reduce((acc, { code }) => acc + "/" + code, "");

        const isActive = pathname !== "/" && codesTogether.includes(pathname);
        const MenuNavIcon = () => (
          <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            m="5px 15px"
          >
            <Box color={isActive ? themeColor : gray} fontSize="0.75em">
              {t(`navigation;${displayName}`)}
            </Box>
            {/* FIXME: same width for each */}
            <Image
              src={`/layout/${code}.png`}
              height={48}
              width={48}
              alt={code}
              priority
              style={{ cursor: "pointer", userSelect: "none" }}
            />
            {menuItems.length > 0 && (
              <Box ml="0.1rem" lineHeight="0.5rem">
                ▾
              </Box>
            )}
          </Flex>
        );
        if (!menuItems.length) {
          return (
            <Link key={code} href={"/" + code}>
              <a>
                <MenuNavIcon />
              </a>
            </Link>
          );
        }

        return (
          <Menu key={code}>
            <MenuButton>
              <MenuNavIcon />
            </MenuButton>
            <MenuList bg={secondaryBgColor} color={textColor}>
              <MenuGroup title={t(`navigation;${displayName}`)}>
                {menuItems.map((item) => (
                  <Link key={item.code} href={"/" + item.code}>
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
                        {t(
                          `navigation;${
                            item.displayName !== "Voting"
                              ? item.displayName
                              : isVoting
                              ? "Voting"
                              : "Next voting"
                          }`
                        )}
                        {!isVoting && item.toAppend}
                      </Box>
                    </MenuItem>
                  </Link>
                ))}
              </MenuGroup>
            </MenuList>
          </Menu>
        );
      })}
    </Flex>
  );
};

export default IconNavBar;
