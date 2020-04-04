import React, { useState, useEffect, useContext } from "react"
import {
  USERS_FOR_VOTING,
  UsersForVotingData,
  VotingSuggested,
} from "../../graphql/queries/usersForVoting"
import { useQuery, useMutation } from "@apollo/react-hooks"

import Loading from "../common/Loading"
import Error from "../common/Error"
import { ADD_VOTES, AddVotesVars } from "../../graphql/mutations/addVotes"
import { useToast, Progress, Box, Flex } from "@chakra-ui/core"
import { UserLean } from "../../types"
import Alert from "../elements/Alert"
import MyThemeContext from "../../themeContext"
import Button from "../elements/Button"
import PersonForVoting from "./PersonForVoting"
import SubHeader from "../common/SubHeader"
import { PLUS_INFO } from "../../graphql/queries/plusInfo"

interface VotingProps {
  user: UserLean
  votingEnds: number
  votedSoFar: number
  eligibleVoters: number
}

interface SuggestedArrays {
  sameRegion: VotingSuggested[]
  otherRegion: VotingSuggested[]
}

const Voting: React.FC<VotingProps> = ({
  user,
  votingEnds,
  votedSoFar,
  eligibleVoters,
}) => {
  const { themeColor, grayWithShade } = useContext(MyThemeContext)
  const { data, loading, error } = useQuery<UsersForVotingData>(
    USERS_FOR_VOTING
  )
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [suggestedArrays, setSuggestedArrays] = useState<SuggestedArrays>({
    sameRegion: [],
    otherRegion: [],
  })
  const toast = useToast()

  const [addVotesMutation, { loading: addVotesLoading }] = useMutation<
    boolean,
    AddVotesVars
  >(ADD_VOTES, {
    onCompleted: (data) => {
      window.scrollTo(0, 0)
      toast({
        description: `Votes submitted`,
        position: "top-right",
        status: "success",
        duration: 10000,
      })
    },
    onError: (error) => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      })
    },
    refetchQueries: [
      {
        query: USERS_FOR_VOTING,
      },
      {
        query: PLUS_INFO,
      },
    ],
  })

  const handleSubmit = async () => {
    await addVotesMutation({
      variables: {
        votes: Object.keys(votes).map((key) => ({
          discord_id: key,
          score: (votes as any)[key],
        })),
      },
    })
  }

  useEffect(() => {
    if (loading || error) return

    const sameRegionSuggested: VotingSuggested[] = []
    const otherRegionSuggested: VotingSuggested[] = []

    data!.usersForVoting.suggested.forEach((suggested) => {
      if (suggested.plus_region === user.plus!.plus_region) {
        sameRegionSuggested.push(suggested)
      } else {
        otherRegionSuggested.push(suggested)
      }
    })

    setSuggestedArrays({
      sameRegion: sameRegionSuggested,
      otherRegion: otherRegionSuggested,
    })

    if (data!.usersForVoting.votes) {
      const voteObj: Record<string, number> = {}
      data!.usersForVoting.votes.forEach(
        (vote) => (voteObj[vote.discord_id] = vote.score)
      )
      setVotes(voteObj)
    }
  }, [loading, error, data, user])

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const date = new Date()
  if (votingEnds < date.getTime())
    return (
      <Alert status="info">
        Voting is over. Results will be posted a bit later.
      </Alert>
    )

  const hoursLeft = Math.ceil((votingEnds - date.getTime()) / (1000 * 60 * 60))
  const alreadyVoted = data!.usersForVoting.votes.length > 0

  const missingVotes =
    data!.usersForVoting.users.length +
    data!.usersForVoting.suggested.length -
    Object.keys(votes).length

  return (
    <>
      <Alert status={alreadyVoted ? "success" : "info"}>{`${
        alreadyVoted
          ? "You have voted! Editing and resubmitting before deadline possible. "
          : ""
      }Voting ends ${new Date(votingEnds).toLocaleString()} (${hoursLeft}
          hours left)`}</Alert>
      <Box mt="1em" textAlign="center" color={grayWithShade}>
        <Progress
          value={(votedSoFar / eligibleVoters) * 100}
          color={themeColor}
        />
        {votedSoFar}/{eligibleVoters} voted so far
      </Box>
      <Box mt="2em">
        <SubHeader>
          {user.plus!.plus_region === "EU" ? "European" : "American"} players
        </SubHeader>
        {data!.usersForVoting.users.map((userForVoting) => {
          if (userForVoting.plus.plus_region !== user.plus!.plus_region)
            return null
          return (
            <PersonForVoting
              key={userForVoting.discord_id}
              user={userForVoting}
              votes={votes}
              setVotes={setVotes}
            />
          )
        })}
      </Box>
      {suggestedArrays.sameRegion.length > 0 && (
        <>
          <SubHeader>
            {user.plus!.plus_region === "EU" ? "European" : "American"} players
            (suggested)
          </SubHeader>
          {suggestedArrays.sameRegion.map((suggestion) => {
            return (
              <PersonForVoting
                key={suggestion.discord_user.discord_id}
                user={suggestion.discord_user}
                suggester={suggestion.suggester_discord_user}
                votes={votes}
                setVotes={setVotes}
                description={suggestion.description}
              />
            )
          })}
        </>
      )}
      <SubHeader>
        {user.plus!.plus_region === "NA" ? "European" : "American"} players
      </SubHeader>
      {data!.usersForVoting.users.map((userForVoting) => {
        if (userForVoting.plus.plus_region === user.plus!.plus_region)
          return null
        return (
          <PersonForVoting
            key={userForVoting.discord_id}
            user={userForVoting}
            votes={votes}
            setVotes={setVotes}
            sameRegion={false}
          />
        )
      })}
      {suggestedArrays.otherRegion.length > 0 && (
        <>
          <SubHeader>
            {user.plus!.plus_region === "NA" ? "European" : "American"} players
            (suggested)
          </SubHeader>

          {suggestedArrays.otherRegion.map((suggestion) => {
            return (
              <PersonForVoting
                key={suggestion.discord_user.discord_id}
                user={suggestion.discord_user}
                votes={votes}
                setVotes={setVotes}
                sameRegion={false}
              />
            )
          })}
        </>
      )}
      <Flex mt="2em" alignItems="center">
        <Box mr="1em">
          <Button
            disabled={missingVotes > 0}
            onClick={handleSubmit}
            loading={addVotesLoading}
          >
            Submit
          </Button>
        </Box>
        {missingVotes > 0 && (
          <>
            You need to vote on {missingVotes} more player
            {missingVotes > 1 ? "s" : ""}
          </>
        )}
      </Flex>
    </>
  )
}

export default Voting
