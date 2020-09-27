import {
  Box,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/core"
import { Link, useLocation } from "@reach/router"
import React, { Suspense, useContext } from "react"
import { useTranslation } from "react-i18next"
import MyThemeContext from "../../themeContext"

const getFirstFridayDate = () => {
  const today = new Date()
  const month =
    today.getDate() <= 7 && today.getDay() <= 5
      ? today.getMonth()
      : today.getMonth() + 1

  let day = 1
  while (day <= 7) {
    const dateOfVoting = new Date(
      Date.UTC(today.getFullYear(), month, day, 15, 0, 0)
    )

    if (dateOfVoting.getDay() === 5) return dateOfVoting

    day++
  }

  console.error("Couldn't resolve first friday of the month for voting")
  return new Date(2000, 1, 1)
}

export const navIcons: {
  code: string
  displayName: string
  menuItems: {
    code: string
    displayName: string
    disabled?: boolean
    toAppend?: string
  }[]
}[] = [
  {
    code: "xsearch",
    displayName: "Top 500",
    menuItems: [
      { code: "xsearch", displayName: "Browser" },
      { code: "xtrends", displayName: "Trends" },
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
        code: "/voting",
        displayName: "Next voting",
        disabled: true,
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
]

const IconNavBar = () => {
  const { t } = useTranslation()
  const {
    darkerBgColor,
    textColor,
    themeColorWithShade,
    grayWithShade,
  } = useContext(MyThemeContext)
  const location = useLocation()

  return (
    <Flex bg={darkerBgColor} py={2} justifyContent="center" flexWrap="wrap">
      <Suspense fallback={null}>
        {navIcons.map(({ displayName, code, menuItems }) => {
          const codesTogether =
            "/" +
            code +
            menuItems.reduce((acc, { code }) => acc + "/" + code, "")
          const MenuNavIcon = () => (
            <Flex
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              m="5px 15px"
              color={textColor}
            >
              {location.pathname !== "/" &&
              codesTogether.includes(location.pathname) ? (
                <Box color={themeColorWithShade} fontSize="0.75em">
                  {displayName}
                </Box>
              ) : (
                <Box color={grayWithShade} fontSize="0.75em">
                  {displayName}
                </Box>
              )}
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
          )
          if (!menuItems.length) {
            return (
              <Link key={code} to={code}>
                <MenuNavIcon />
              </Link>
            )
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
                      <MenuItem disabled={item.disabled}>
                        {location.pathname === "/" + item.code ? (
                          <Box
                            h="5px"
                            w="5px"
                            mb={1}
                            bgColor={themeColorWithShade}
                            borderRadius="50%"
                            lineHeight="0.5rem"
                            mr="7px"
                            mt="4px"
                          />
                        ) : (
                          <Box
                            h="5px"
                            w="5px"
                            mb={1}
                            borderRadius="50%"
                            lineHeight="0.5rem"
                            mr="7px"
                            mt="4px"
                            opacity={1}
                          />
                        )}
                        <Box>
                          {t(`navigation;${item.displayName}`)}
                          {item.toAppend}
                        </Box>
                      </MenuItem>
                    </Link>
                  ))}
                </MenuGroup>
              </MenuList>
            </Menu>
          )
        })}
      </Suspense>
    </Flex>
  )
}

export default IconNavBar
