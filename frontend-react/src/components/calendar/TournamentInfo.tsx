import React, { useState, useContext } from "react"
import { CompetitiveFeedEvent } from "../../graphql/queries/upcomingEvents"
import Markdown from "../elements/Markdown"
import { Heading, Box, Flex, Link as ChakraLink } from "@chakra-ui/core"
import Button from "../elements/Button"
import { FiInfo, FiClock } from "react-icons/fi"
import { FaDiscord } from "react-icons/fa"
import MyThemeContext from "../../themeContext"
import UserAvatar from "../common/UserAvatar"
import { Link } from "@reach/router"

interface TournamentInfoProps {
  tournament: CompetitiveFeedEvent
  date: Date
}

const TournamentInfo: React.FC<TournamentInfoProps> = ({
  tournament,
  date,
}) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)
  const [expanded, setExpanded] = useState(false)
  const poster = tournament.poster_discord_user
  return (
    <Box>
      <Heading fontFamily="'Rubik', sans-serif" size="lg">
        {tournament.name}
      </Heading>
      <Flex alignItems="center" color={grayWithShade}>
        <Box as={FiClock} mr="0.5em" color={themeColorWithShade} />
        {date.toLocaleString()}
      </Flex>

      <Flex alignItems="center" color={grayWithShade} my="0.5em">
        {poster.twitter_name && (
          <Box mr="0.5em">
            <UserAvatar
              twitterName={poster.twitter_name}
              name={poster.username}
              size="sm"
            />
          </Box>
        )}{" "}
        <Link to={`/u/${poster.discord_id}`}>
          <Box>
            {poster.username}#{poster.discriminator}
          </Box>
        </Link>
      </Flex>

      <Flex flexWrap="wrap" my="1em">
        <Box mr="1em" mb="1em">
          <a href={tournament.discord_invite_url}>
            <Button outlined icon={FaDiscord} width="150px">
              Join Discord
            </Button>
          </a>
        </Box>
        <Button
          outlined={expanded}
          onClick={() => setExpanded(!expanded)}
          icon={FiInfo}
          width="150px"
        >
          {expanded ? "Hide info" : "Show info"}
        </Button>
      </Flex>
      {expanded && <Markdown value={tournament.description} />}
    </Box>
  )
}

export default TournamentInfo
