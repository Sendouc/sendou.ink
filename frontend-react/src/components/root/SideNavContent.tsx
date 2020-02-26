import React from "react"
import { IconButton, useColorMode, Flex, List } from "@chakra-ui/core"
import { Link } from "@reach/router"
import {
  FaTshirt,
  FaCalendarAlt,
  FaMap,
  FaPlus,
  FaTrophy,
  FaUserSecret,
  FaSignInAlt,
} from "react-icons/fa"
import Logo from "./Logo"
import NavItem from "./NavItem"
import { useQuery } from "@apollo/react-hooks"
import { USER } from "../../graphql/queries/user"
import UserAvatar from "../common/UserAvatar"
import DividingBox from "../common/DividingBox"
import { UserData } from "../../types"
import ColorPicker from "./ColorPicker"
import Error from "../common/Error"

const UserItem: React.FC<{ data?: UserData }> = ({ data }) => {
  if (!data || !data.user) {
    // prolly need to do href here
    return (
      <List>
        <NavItem
          to="auth/discord"
          Icon={FaSignInAlt}
          title="Log in via Discord"
        />
      </List>
    )
  }

  return (
    <Link
      to={
        data.user.custom_url
          ? `u/${data.user.custom_url}`
          : `u/${data.user.discord_id}`
      }
    >
      <UserAvatar
        name={data.user.username}
        twitterName={data.user.twitter_name}
      />
    </Link>
  )
}

interface SideNavProps {
  showLogo?: boolean
}

export const SideNavContent: React.FC<SideNavProps> = ({ showLogo = true }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { data, error, loading } = useQuery<UserData>(USER)

  if (error) return <Error errorMessage={error.message} />

  console.log("data", data)
  return (
    <Flex
      direction="column"
      h="100%"
      py={8}
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex direction="column">
        {showLogo && (
          <Flex alignSelf="center">
            <Link to="/">
              <Logo />
            </Link>
          </Flex>
        )}
        <Flex>
          <List spacing={4} mt="2em">
            <NavItem to="plans" Icon={FaMap} title="Map Planner" />
            <NavItem to="calendar" Icon={FaCalendarAlt} title="Calendar" />
            <NavItem to="builds" Icon={FaTshirt} title="Builds" />
            <NavItem to="freeagents" Icon={FaUserSecret} title="Free Agents" />
            <NavItem to="xsearch" Icon={FaTrophy} title="Top 500 Browser" />
            {data?.user?.plus?.membership_status && (
              <NavItem to="plus" Icon={FaPlus} title="Plus Server" />
            )}
          </List>
        </Flex>
      </Flex>
      <Flex align="flex-end" direction="column" alignItems="center">
        <DividingBox location="bottom" margin="0.7em">
          <Flex
            alignSelf="center"
            alignItems="center"
            justifyContent="center"
            flexBasis="100%"
          >
            <IconButton
              aria-label={`Switch to ${
                colorMode === "light" ? "dark" : "light"
              } mode`}
              variant="ghost"
              color="current"
              fontSize="20px"
              onClick={toggleColorMode}
              icon={colorMode === "light" ? "moon" : "sun"}
            />
            <ColorPicker />
          </Flex>
        </DividingBox>
        {!loading && !error && <UserItem data={data} />}
      </Flex>
    </Flex>
  )
}
