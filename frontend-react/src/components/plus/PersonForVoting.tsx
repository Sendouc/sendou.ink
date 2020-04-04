import React, { useContext } from "react"
import { Link } from "@reach/router"
import UserAvatar from "../common/UserAvatar"
import { Flex, Avatar, Box, Grid } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface VotingButtonProps {
  value: 2 | 1 | -1 | -2
  handleClick: (oldValue: number) => void
  gridArea: string
  active: boolean
}

const buttonBg = {
  "-2": "red.500",
  "-1": "red.500",
  "1": "green.500",
  "2": "green.500",
} as const

const VotingButton: React.FC<VotingButtonProps> = ({
  value,
  handleClick,
  gridArea,
  active,
}) => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gridArea={gridArea}
    >
      <Flex
        onClick={() => handleClick(value)}
        alignItems="center"
        justifyContent="center"
        borderRadius="50%"
        w="50px"
        h="50px"
        fontWeight="bolder"
        border={active ? "4px solid" : undefined}
        borderColor={buttonBg[value]}
        fontSize="24px"
        cursor="pointer"
        userSelect="none"
      >
        {value > 0 ? "+" : ""}
        {value}
      </Flex>
    </Flex>
  )
}

interface PersonForVotingProps {
  votes: Record<string, number>
  setVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
  user: {
    username: string
    discriminator: string
    twitter_name?: string | undefined
    discord_id: string
  }
  suggester?: {
    username: string
    discriminator: string
  }
  description?: string
  sameRegion?: boolean
}

const PersonForVoting: React.FC<PersonForVotingProps> = ({
  votes,
  setVotes,
  user,
  suggester,
  description,
  sameRegion = true,
}) => {
  const { grayWithShade } = useContext(MyThemeContext)

  const handleClick = (value: number) => {
    setVotes({ ...votes, [user.discord_id]: value })
  }

  return (
    <Grid
      gridTemplateColumns="repeat(4, 1fr)"
      gridTemplateRows="repeat(2, 1fr)"
      my="1em"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="12px"
    >
      <Flex
        gridArea="1 / 1 / 2 / 5"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <UserAvatar twitterName={user.twitter_name} name={user.username} />

        <Link to={`/u/${user.discord_id}`}>
          <Box
            color={grayWithShade}
            fontWeight="semibold"
            letterSpacing="wide"
            mx="0.5em"
          >
            {user.username}#{user.discriminator}
          </Box>
        </Link>
      </Flex>
      {sameRegion ? (
        <VotingButton
          value={-2}
          handleClick={handleClick}
          gridArea="2 / 1 / 3 / 2"
          active={votes[user.discord_id] === -2}
        />
      ) : (
        <Box gridArea="2 / 2 / 3 / 3" />
      )}
      <VotingButton
        value={-1}
        handleClick={handleClick}
        gridArea="2 / 2 / 3 / 3"
        active={votes[user.discord_id] === -1}
      />
      <VotingButton
        value={1}
        handleClick={handleClick}
        gridArea="2 / 3 / 3 / 4"
        active={votes[user.discord_id] === 1}
      />
      {sameRegion ? (
        <VotingButton
          value={2}
          handleClick={handleClick}
          gridArea="2 / 4 / 3 / 5"
          active={votes[user.discord_id] === 2}
        />
      ) : (
        <Box gridArea="2 / 4 / 3 / 5" />
      )}
    </Grid>
  )
}

export default PersonForVoting
