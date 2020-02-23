import React from "react"
import UserAvatar from "../common/UserAvatar"
import Box from "../elements/Box"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import { Icon } from "@chakra-ui/core"
import { FaTwitter, FaTrophy, FaDiscord } from "react-icons/fa"
import { Link } from "@reach/router"
import { months } from "../../utils/lists"

interface LogoHeaderProps {
  name: string
  twitter_name?: string
  challonge_name?: string
  discord_url?: string
  founded?: {
    month: number
    year: number
  }
}

const LogoHeader: React.FC<LogoHeaderProps> = ({
  name,
  twitter_name,
  challonge_name,
  discord_url,
  founded,
}) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <UserAvatar name={name} twitterName={twitter_name} size="2xl" />
      <Box
        fontFamily="'Pacifico', cursive"
        fontWeight="light"
        fontSize="48px"
        w="100%"
        textAlign="center"
      >
        {name}
      </Box>
      {founded && (
        <Box textAlign="center" mb="1em" color={grayWithShade}>
          Est. {months[founded.month]} {founded.year}
        </Box>
      )}
      <Box
        display="flex"
        flexWrap="wrap"
        borderBottomColor={themeColorWithShade}
        borderBottomWidth="5px"
        w="100%"
        justifyContent="space-evenly"
      >
        {twitter_name && (
          <a href={`https://twitter.com/${twitter_name}`}>
            <Box display="flex" alignItems="center">
              <Box as={FaTwitter} mr="0.3em" /> {twitter_name}
            </Box>
          </a>
        )}
        {challonge_name && (
          <a href={`https://challonge.com/teams/${challonge_name}`}>
            <Box display="flex" alignItems="center">
              <Box as={FaTrophy} mr="0.3em" /> Challonge
            </Box>
          </a>
        )}
        {discord_url && (
          <a href={discord_url}>
            <Box display="flex" alignItems="center">
              <Box as={FaDiscord} mr="0.3em" /> Discord
            </Box>
          </a>
        )}
      </Box>
    </Box>
  )
}

export default LogoHeader
