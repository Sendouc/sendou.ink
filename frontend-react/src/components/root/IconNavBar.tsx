import {
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { Suspense, useContext } from "react"
import MyThemeContext from "../../themeContext"

export const navIcons: {
  code: string
  displayName: string
  menuItems: { code: string; displayName: string }[]
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
      { code: "plus", displayName: "Suggested and vouched players" },
      { code: "plus/history", displayName: "Voting history" },
    ],
  },
]

const IconNavBar = () => {
  const { darkerBgColor } = useContext(MyThemeContext)
  return (
    <Flex
      bg={darkerBgColor}
      justifyContent="center"
      py={2}
      display={["none", null, "flex"]}
    >
      <Suspense fallback={null}>
        {navIcons.map(({ displayName, code, menuItems }) => {
          if (!menuItems.length) {
            return (
              <Link key={code} to={code}>
                <Image
                  src={`${process.env.PUBLIC_URL}/navIcons/${code}.png`}
                  h={12}
                  w={12}
                  mx={2}
                  alt={code}
                  cursor="pointer"
                  userSelect="none"
                  ignoreFallback
                />
              </Link>
            )
          }

          return (
            <Menu key={code}>
              <MenuButton>
                <Image
                  src={`${process.env.PUBLIC_URL}/navIcons/${code}.png`}
                  h={12}
                  w={12}
                  mx={2}
                  alt={code}
                  cursor="pointer"
                  userSelect="none"
                  ignoreFallback
                />
              </MenuButton>
              <MenuList bg={darkerBgColor}>
                <MenuGroup title={displayName}>
                  {menuItems.map((item) => (
                    <Link key={item.code} to={item.code}>
                      <MenuItem>{item.displayName}</MenuItem>
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
