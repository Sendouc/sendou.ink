import React from "react"
import { PseudoBox, useColorMode, ListIcon, ListItem } from "@chakra-ui/core"
import { Link } from "@reach/router"
import { IconType } from "react-icons/lib/cjs"

/*const hoverColor = { light: "gray.900", dark: "whiteAlpha.900" }
const activeColor = { light: "orange.800", dark: "pink.100" }
const activeBg = { light: "orange.50", dark: "#308c7a4d" }*/
const iconColor = { light: "orange.500", dark: "pink.200" }

interface NavItemProps {
  to: string
  Icon: IconType
  title: string
}

const NavItem: React.FC<NavItemProps> = ({ to, Icon, title }) => {
  const { colorMode } = useColorMode()

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
        >
          <ListIcon icon={Icon} color={iconColor[colorMode]} size="1.5em" />{" "}
          {title}
        </PseudoBox>
      </Link>
    </ListItem>
  )
}

export default NavItem
