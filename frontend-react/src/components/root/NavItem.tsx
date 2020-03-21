import React, { useContext } from "react"
import { PseudoBox, ListIcon, ListItem } from "@chakra-ui/core"
import { Link, useLocation } from "@reach/router"
import { IconType } from "react-icons/lib/cjs"
import MyThemeContext from "../../themeContext"

interface NavItemProps {
  to: string
  icon: IconType | string
  title: string
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, title }) => {
  const { themeColorWithShade, colorMode, themeColor } = useContext(
    MyThemeContext
  )

  const location = useLocation()
  const isActive =
    location.pathname.indexOf(to) !== -1 && location.pathname !== "/"

  return (
    <ListItem>
      <Link to={to}>
        <PseudoBox
          mx={-2}
          display="flex"
          cursor="pointer"
          px="2"
          py="1"
          transition="all 0.2s"
          fontWeight="medium"
          outline="none"
          _focus={{ shadow: "outline" }}
          _hover={{
            transform: "translateX(2px)",
          }}
          {...(isActive && {
            bg:
              colorMode === "light" ? `${themeColor}.100` : `${themeColor}.800`,
            rounded: "sm",
            _hover: {},
          })}
        >
          <ListIcon
            icon={icon as any}
            color={themeColorWithShade}
            size="1.5em"
          />{" "}
          {title}
        </PseudoBox>
      </Link>
    </ListItem>
  )
}

export default NavItem
