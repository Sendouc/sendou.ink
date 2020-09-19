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
        displayName:
          "Next voting: " +
          getFirstFridayDate().toLocaleString("default", {
            month: "short",
            day: "numeric",
          }),
        disabled: true,
      },
      { code: "plus", displayName: "Suggested and vouched players" },
      { code: "plus/history", displayName: "Voting history" },
      { code: "draft", displayName: "Draft Cup" },
      { code: "plus/faq", displayName: "FAQ" },
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
          const MenuNavIcon = () => (
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
              <MenuList bg={darkerBgColor}>
                <MenuGroup title={displayName}>
                  {menuItems.map((item) => (
                    <Link key={item.code} to={item.code}>
                      <MenuItem disabled={item.disabled}>
                        {item.displayName}
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
