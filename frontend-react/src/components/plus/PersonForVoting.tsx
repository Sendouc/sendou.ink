import { Box, Flex, Grid } from "@chakra-ui/core"
import React, { useContext, useState } from "react"
import MyThemeContext from "../../themeContext"
import { months } from "../../utils/lists"
import UserAvatar from "../common/UserAvatar"
import Button from "../elements/Button"
import Markdown from "../elements/Markdown"

interface VotingButtonProps {
  value: 2 | 1 | -1 | -2
  handleClick: (oldValue: number) => void
  gridArea: string
  active: boolean
  lastTime: boolean
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
  lastTime,
}) => {
  const { grayWithShade } = useContext(MyThemeContext)

  const d = new Date()
  let month = d.getMonth()
  if (month === 0) month = 12

  const monthStr = months[month]
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
      {lastTime && (
        <Box color={grayWithShade} fontSize="0.75em">
          {monthStr}
        </Box>
      )}
    </Flex>
  )
}

interface PersonForVotingProps {
  votes: Record<string, number>
  setVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
  user: {
    username: string
    discriminator: string
    avatar?: string
    discord_id: string
    bio?: string
  }
  suggester?: {
    username: string
    discriminator: string
  }
  description?: string
  sameRegion?: boolean
  oldVote?: number
}

const PersonForVoting: React.FC<PersonForVotingProps> = ({
  votes,
  setVotes,
  user,
  suggester,
  description,
  oldVote,
  sameRegion = true,
}) => {
  const [showBio, setShowBio] = useState(false)
  const { grayWithShade } = useContext(MyThemeContext)

  const handleClick = (value: number) => {
    setVotes({ ...votes, [user.discord_id]: value })
  }

  return (
    <Box
      my="1em"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="12px"
    >
      <Grid
        gridTemplateColumns="repeat(4, 1fr)"
        gridTemplateRows="repeat(2, 1fr)"
      >
        <Flex
          gridArea="1 / 1 / 2 / 5"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <UserAvatar src={user.avatar} name={user.username} />

          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/u/${user.discord_id}`}
          >
            <Box
              color={grayWithShade}
              fontWeight="semibold"
              letterSpacing="wide"
              mx="0.5em"
              mt="0.2em"
            >
              {user.username}#{user.discriminator}
            </Box>
          </a>
        </Flex>
        {sameRegion ? (
          <VotingButton
            value={-2}
            handleClick={handleClick}
            gridArea="2 / 1 / 3 / 2"
            active={votes[user.discord_id] === -2}
            lastTime={oldVote === -2}
          />
        ) : (
          <Box gridArea="2 / 2 / 3 / 3" />
        )}
        <VotingButton
          value={-1}
          handleClick={handleClick}
          gridArea="2 / 2 / 3 / 3"
          active={votes[user.discord_id] === -1}
          lastTime={oldVote === -1}
        />
        <VotingButton
          value={1}
          handleClick={handleClick}
          gridArea="2 / 3 / 3 / 4"
          active={votes[user.discord_id] === 1}
          lastTime={oldVote === 1}
        />
        {sameRegion ? (
          <VotingButton
            value={2}
            handleClick={handleClick}
            gridArea="2 / 4 / 3 / 5"
            active={votes[user.discord_id] === 2}
            lastTime={oldVote === 2}
          />
        ) : (
          <Box gridArea="2 / 4 / 3 / 5" />
        )}
        {description && (
          <Box p="1em" gridArea="3 / 1 / 3 / 5" textAlign="center">
            <Box as="span" fontStyle="italic">
              "{description}"
            </Box>
            <Box as="span" ml="0.5em" color={grayWithShade}>
              - {suggester!.username}#{suggester!.discriminator}
            </Box>
          </Box>
        )}
      </Grid>
      {user.bio && (
        <Box textAlign="center" my="1em">
          <Button onClick={() => setShowBio(!showBio)} outlined>
            {showBio ? "Hide bio" : "Show bio"}
          </Button>
        </Box>
      )}
      {showBio && (
        <Box p="1em">
          <Markdown value={user.bio!} />
        </Box>
      )}
    </Box>
  )
}

export default PersonForVoting
