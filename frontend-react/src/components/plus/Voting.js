import React, { useState, useEffect } from "react"
import { usersForVoting } from "../../graphql/queries/usersForVoting"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { Grid, Message, Button, Progress } from "semantic-ui-react"
import { Prompt } from "react-router-dom"

import Loading from "../common/Loading"
import Error from "../common/Error"
import VotingGridRow from "./VotingGridRow"
import { addVotes } from "../../graphql/mutations/addVotes"

const Voting = ({
  user,
  handleSuccess,
  handleError,
  votingEnds,
  votedSoFar,
  eligibleVoters,
}) => {
  const { data, loading, error } = useQuery(usersForVoting)
  const [votes, setVotes] = useState({})
  const [voteCount, setVoteCount] = useState(0)
  const [suggestedArrays, setSuggestedArrays] = useState(null)

  const [addVotesMutation] = useMutation(addVotes, {
    onError: handleError,
    onCompleted: () => handleSuccess("Votes successfully recorded."),
    refetchQueries: [
      {
        query: usersForVoting,
      },
    ],
  })

  const handleSubmit = async () => {
    await addVotesMutation({
      variables: {
        votes: Object.keys(votes).map(key => ({
          discord_id: key,
          score: votes[key],
        })),
      },
    })
  }

  useEffect(() => {
    if (loading || error) return

    const sameRegionSuggested = []
    const otherRegionSuggested = []

    data.usersForVoting.suggested.forEach(suggested => {
      if (suggested.plus_region === user.plus.plus_region) {
        sameRegionSuggested.push(suggested)
      } else {
        otherRegionSuggested.push(suggested)
      }
    })

    setSuggestedArrays({
      sameRegion: sameRegionSuggested,
      otherRegion: otherRegionSuggested,
    })

    if (data.usersForVoting.votes) {
      const voteObj = {}
      data.usersForVoting.votes.forEach(
        vote => (voteObj[vote.discord_id] = vote.score)
      )
      setVotes(voteObj)
      setVoteCount(data.usersForVoting.votes.length)
    }
  }, [loading, error, data, user])

  if (error) return <Error errorMessage={error.message} />
  if (loading || !suggestedArrays) return <Loading />
  const date = new Date()
  if (votingEnds < date.getTime())
    return (
      <Message>
        <Message.Header>Voting for the month is over</Message.Header>
        Results will be posted later
      </Message>
    )

  const hoursLeft = Math.ceil((votingEnds - date.getTime()) / (1000 * 60 * 60))
  const alreadyVoted = data.usersForVoting.votes.length > 0

  return (
    <>
      <Prompt
        when={
          voteCount > 0 &&
          voteCount <
            data.usersForVoting.users.length +
              data.usersForVoting.suggested.length
        }
        message="Are you sure you want to leave? Vote form won't be saved."
      />
      <Message
        success={alreadyVoted}
        icon={alreadyVoted ? "check" : null}
        header={alreadyVoted ? "You have voted (editing possible)" : null}
        content={`Voting ends ${new Date(
          votingEnds
        ).toLocaleString()} (${hoursLeft}~
          hours left)`}
      />
      <Progress
        value={votedSoFar}
        total={eligibleVoters}
        progress="ratio"
        color="blue"
      >
        Voted so far
      </Progress>
      <h2 style={{ marginTop: "1em" }}>
        {user.plus.plus_region === "EU" ? "European" : "American"} players
      </h2>
      <Grid>
        {data.usersForVoting.users.map(userForVoting => {
          if (userForVoting.plus.plus_region !== user.plus.plus_region)
            return null
          return (
            <VotingGridRow
              key={userForVoting.discord_id}
              user={userForVoting}
              votes={votes}
              setVotes={setVotes}
              increaseCount={() => setVoteCount(voteCount + 1)}
            />
          )
        })}
      </Grid>
      {suggestedArrays.sameRegion.length > 0 && (
        <>
          <h2 style={{ marginTop: "2em" }}>
            {user.plus.plus_region === "EU" ? "European" : "American"} players
            (suggested)
          </h2>
          <Grid>
            {suggestedArrays.sameRegion.map(suggestion => {
              return (
                <VotingGridRow
                  key={suggestion.discord_user.discord_id}
                  user={suggestion.discord_user}
                  suggester={suggestion.suggester_discord_user}
                  votes={votes}
                  setVotes={setVotes}
                  description={suggestion.description}
                  increaseCount={() => setVoteCount(voteCount + 1)}
                />
              )
            })}
          </Grid>
        </>
      )}
      <h2 style={{ marginTop: "2em" }}>
        {user.plus.plus_region === "NA" ? "European" : "American"} players
      </h2>
      <Grid>
        {data.usersForVoting.users.map(userForVoting => {
          if (userForVoting.plus.plus_region === user.plus.plus_region)
            return null
          return (
            <VotingGridRow
              key={userForVoting.discord_id}
              user={userForVoting}
              votes={votes}
              setVotes={setVotes}
              sameRegion={false}
              increaseCount={() => setVoteCount(voteCount + 1)}
            />
          )
        })}
      </Grid>
      {suggestedArrays.otherRegion.length > 0 && (
        <>
          <h2 style={{ marginTop: "2em" }}>
            {user.plus.plus_region === "NA" ? "European" : "American"} players
            (suggested)
          </h2>
          <Grid>
            {suggestedArrays.otherRegion.map(suggestion => {
              return (
                <VotingGridRow
                  key={suggestion.discord_user.discord_id}
                  user={suggestion.discord_user}
                  votes={votes}
                  setVotes={setVotes}
                  sameRegion={false}
                  increaseCount={() => setVoteCount(voteCount + 1)}
                />
              )
            })}
          </Grid>
        </>
      )}
      <Button
        disabled={
          voteCount <
          data.usersForVoting.users.length +
            data.usersForVoting.suggested.length
        }
        positive
        style={{ marginTop: "2em" }}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </>
  )
}

export default Voting
