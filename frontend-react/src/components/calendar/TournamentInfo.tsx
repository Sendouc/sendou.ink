import React, { useState, useContext } from "react"
import { CompetitiveFeedEvent } from "../../graphql/queries/upcomingEvents"
import Markdown from "../elements/Markdown"
import { Heading, Box, Flex, Image } from "@chakra-ui/core"
import Button from "../elements/Button"
import { FiInfo, FiClock, FiEdit } from "react-icons/fi"
import { FaDiscord, FaInfo, FaEdit } from "react-icons/fa"
import MyThemeContext from "../../themeContext"
import UserAvatar from "../common/UserAvatar"
import { Link } from "@reach/router"
import { UserData } from "../../types"
import { USER } from "../../graphql/queries/user"
import { useQuery } from "@apollo/react-hooks"
import TournamentModal from "./TournamentModal"

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
  const [showModal, setShowModal] = useState(false)
  const poster = tournament.poster_discord_user

  const { data: userData } = useQuery<UserData>(USER)

  return (
    <>
      {showModal && (
        <TournamentModal
          competitiveFeedEvent={tournament}
          closeModal={() => setShowModal(false)}
        />
      )}
      <>
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
          <Box mb="1em" mr="1em">
            <a href={tournament.discord_invite_url}>
              <Button outlined icon={FaDiscord} width="150px">
                Join Discord
              </Button>
            </a>
          </Box>
          <Box mb="1em" mr="1em">
            <Button
              outlined={expanded}
              onClick={() => setExpanded(!expanded)}
              width="150px"
              icon={FaInfo}
            >
              {expanded ? "Hide info" : "Show info"}
            </Button>
          </Box>
          {userData?.user?.discord_id === poster.discord_id && (
            <Button
              icon={FaEdit}
              width="150px"
              onClick={() => setShowModal(true)}
            >
              Edit
            </Button>
          )}
        </Flex>
        {expanded && (
          <>
            <Markdown value={tournament.description} />
            {tournament.picture_url && (
              <Image borderRadius="5px" src={tournament.picture_url} />
            )}
          </>
        )}
      </>
    </>
  )
}

export default TournamentInfo
