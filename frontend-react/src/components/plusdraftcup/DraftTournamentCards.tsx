import React, { useContext } from "react"
import {
  Flex,
  Grid,
  PseudoBox,
  Box,
  Image,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/core"
import trophy from "../../assets/trophy.png"
import MyThemeContext from "../../themeContext"
import { months } from "../../utils/lists"
import { Link } from "@reach/router"
import UserAvatar from "../common/UserAvatar"
import { medalEmoji } from "../../assets/imageImports"

interface DraftTournamentCardsProps {
  tournaments: {
    name: string
    top_3_team_names: string[]
    top_3_discord_users: {
      username: string
      discriminator: string
      twitter_name?: string
    }[][]
    bracket_url: string
    date: string
    type: "DRAFTONE" | "DRAFTTWO"
  }[]
}

interface DraftTournamentCardProps {
  tournament: {
    name: string
    top_3_team_names: string[]
    top_3_discord_users: {
      username: string
      discriminator: string
      twitter_name?: string
    }[][]
    bracket_url: string
    date: string
    type: "DRAFTONE" | "DRAFTTWO"
  }
}

interface MedalRowProps {
  players: {
    username: string
    discriminator: string
    twitter_name?: string
  }[]
  medalImage: string
  small?: boolean
}

export const DraftTournamentCard: React.FC<DraftTournamentCardProps> = ({
  tournament,
}) => {
  const { grayWithShade, darkerBgColor } = useContext(MyThemeContext)
  const a = new Date(parseInt(tournament.date))
  const dateStr = `${a.getDate()} ${
    months[a.getMonth() + 1]
  } ${a.getFullYear()}`

  const MedalRow: React.FC<MedalRowProps> = ({
    players,
    medalImage,
    small,
  }) => {
    return (
      <Flex alignItems="center" mt="1.5em" fontWeight="semibold" as="h4">
        <Image
          w={small ? "30px" : "40px"}
          h="auto"
          src={medalImage}
          mr="0.5em"
        />{" "}
        {players.map(user => (
          <Box key={`${user.username}#${user.discriminator}`} mx="0.2em">
            <Popover trigger="hover" placement="top-start">
              <PopoverTrigger>
                <Box>
                  <UserAvatar
                    twitterName={user.twitter_name}
                    name={user.username}
                    size={small ? "sm" : "lg"}
                  />
                </Box>
              </PopoverTrigger>
              <PopoverContent
                border="0"
                p="0.5em"
                zIndex={4}
                bg={darkerBgColor}
              >
                <PopoverArrow />
                {user.username}#{user.discriminator}
              </PopoverContent>
            </Popover>
          </Box>
        ))}
      </Flex>
    )
  }

  return (
    <Box
      display="flex"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="25px"
      w="100%"
      h="100%"
      flexDirection="column"
      justifyContent="space-between"
      transition="all 0.2s"
    >
      <Box fontWeight="semibold" as="h4" lineHeight="tight">
        {tournament.name}
      </Box>
      <Box
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="xs"
        mt="0.5em"
      >
        {dateStr}
      </Box>
      <MedalRow
        players={tournament.top_3_discord_users[0]}
        medalImage={trophy}
      />
      <Flex>
        <MedalRow
          players={tournament.top_3_discord_users[1]}
          medalImage={medalEmoji[2]}
          small
        />
        <Box ml="1.5em">
          <MedalRow
            players={tournament.top_3_discord_users[2]}
            medalImage={medalEmoji[3]}
            small
          />
        </Box>
      </Flex>
    </Box>
  )
}

const DraftTournamentCards: React.FC<DraftTournamentCardsProps> = ({
  tournaments,
}) => {
  return (
    <>
      <Grid
        gridGap="1em"
        gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))"
        mt="1em"
      >
        {tournaments.map(tournament => {
          const date = new Date(parseInt(tournament.date))
          return (
            <Link
              key={tournament.bracket_url}
              to={`/plus/draft/${
                tournament.type === "DRAFTTWO" ? "2" : "1"
              }-${months[
                date.getMonth() + 1
              ].toLowerCase()}-${date.getFullYear()}`}
            >
              <DraftTournamentCard tournament={tournament} />
            </Link>
          )
        })}
      </Grid>
    </>
  )
}

export default DraftTournamentCards
