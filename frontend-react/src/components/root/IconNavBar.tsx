import { useQuery } from "@apollo/client";
import {
  Box,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/core";
import { Link, useLocation } from "@reach/router";
import React, { Suspense, useContext } from "react";
import { useTranslation } from "react-i18next";
import { PlusInfoData, PLUS_INFO } from "../../graphql/queries/plusInfo";
import MyThemeContext from "../../themeContext";

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
    darkerBgColor,
    textColor,
    themeColorWithShade,
    grayWithShade,
  } = useContext(MyThemeContext);
  const location = useLocation();

  const { data: plusInfoData } = useQuery<PlusInfoData>(PLUS_INFO);

  const isVoting = !!plusInfoData?.plusInfo?.voting_ends;

  return (
    <Flex bg={darkerBgColor} py={2} justifyContent="center" flexWrap="wrap">
      <Suspense fallback={null}>
        {navIcons.map(({ displayName, code, menuItems }) => {
          const codesTogether =
            "/" +
            code +
            menuItems.reduce((acc, { code }) => acc + "/" + code, "");

          const isActive =
            location.pathname !== "/" &&
            codesTogether.includes(location.pathname);
          const MenuNavIcon = () => (
            <Flex
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              m="5px 15px"
              color={textColor}
            >
              <Box
                color={isActive ? themeColorWithShade : grayWithShade}
                fontSize="0.75em"
              >
                {t(`navigation;${displayName}`)}
              </Box>
              <Image
                src={`${process.env.PUBLIC_URL}/navIcons/${code}.png`}
                h={12}
                w={12}
                alt={code}
                cursor="pointer"
                userSelect="none"
                ignoreFallback
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
              <Link key={code} to={code}>
                <MenuNavIcon />
              </Link>
            );
          }

          return (
            <Menu key={code}>
              <MenuButton>
                <MenuNavIcon />
              </MenuButton>
              <MenuList bg={darkerBgColor} color={textColor}>
                <MenuGroup title={t(`navigation;${displayName}`)}>
                  {menuItems.map((item) => (
                    <Link key={item.code} to={item.code}>
                      <MenuItem
                        disabled={item.displayName === "Voting" && !isVoting}
                      >
                        {location.pathname === "/" + item.code ? (
                          <Box
                            h="7px"
                            w="7px"
                            mb={1}
                            bgColor={themeColorWithShade}
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
      </Suspense>
    </Flex>
  );
};

export default IconNavBar;
