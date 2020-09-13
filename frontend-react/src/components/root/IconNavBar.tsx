import React, { useContext, Suspense } from "react"
import {
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import { Link } from "@reach/router"

export const navIcons: {
  code: string
  displayName: string
  menuItems: { code: string; displayName: string }[]
}[] = [
  {
    code: "builds",
    displayName: "Builds",
    menuItems: [
      { code: "builds", displayName: "Browser" },
      { code: "analyzer", displayName: "Analyzer" },
    ],
  },
  //{ name: "analyzer", displayName: "Build Analyzer" },
  { code: "calendar", displayName: "Calendar", menuItems: [] },
  { code: "freeagents", displayName: "Free Agents", menuItems: [] },
  //{ name: "teams", displayName: "Teams" },
  { code: "plans", displayName: "Map Planner", menuItems: [] },
  { code: "tournaments", displayName: "Tournaments", menuItems: [] },
  {
    code: "xsearch",
    displayName: "Top 500",
    menuItems: [
      { code: "xsearch", displayName: "Browser" },
      { code: "xtrends", displayName: "Trends" },
    ],
  },
  { code: "sr", displayName: "Salmon Run", menuItems: [] },
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
            <Menu>
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
                    <Link to={item.code}>
                      <MenuItem key={item.code}>{item.displayName}</MenuItem>
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
