import React, { useContext } from "react"
import { Box, ListIcon, ListItem } from "@chakra-ui/core"
import { Link, useLocation } from "@reach/router"
import { IconType } from "react-icons/lib/cjs"
import MyThemeContext from "../../themeContext"
import { useTranslation } from "react-i18next"

interface NavItemProps {
  to: string
  icon: any
  title: string
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, title }) => {
  const { themeColorWithShade, colorMode, themeColor } = useContext(
    MyThemeContext
  )
  const { t } = useTranslation()

  const location = useLocation()
  const isActive =
    location.pathname.indexOf("/" + to) !== -1 && location.pathname !== "/"

  return (
    <ListItem>
      <Link to={to}>
        <Box
          mx={-2}
          display="flex"
          cursor="pointer"
          px="2"
          py="1"
          transition="all 0.2s"
          fontSize="1.1em"
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
            name={icon}
            color={themeColorWithShade}
            w="1.5em"
            h="1.5em"
          />{" "}
          {t(`navigation;${title}`)}
        </Box>
      </Link>
    </ListItem>
  )
}

export default NavItem
