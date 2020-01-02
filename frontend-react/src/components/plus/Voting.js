import React, { useState, useEffect } from "react"
import { usersForVoting } from "../../graphql/queries/usersForVoting"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { Grid, Message, Button } from "semantic-ui-react"

import Loading from "../common/Loading"
import Error from "../common/Error"
import VotingGridRow from "./VotingGridRow"
import { addVotes } from "../../graphql/mutations/addVotes"

const Voting = ({ user, handleSuccess, handleError }) => {
  const date = new Date()
  const votingEnds = date.valueOf() + 172800000
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

  const randomizeVotes = () => {
    const obj = {}

    data.usersForVoting.suggested.forEach(
      suggest => (obj[suggest.discord_user.discord_id] = 1)
    )
    data.usersForVoting.users.forEach(suggest => (obj[suggest.discord_id] = 1))

    setVotes(obj)
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
  }, [loading, error, data, user])

  if (error) return <Error errorMessage={error.message} />
  if (loading || !suggestedArrays) return <Loading />

  console.log("votes", votes)

  return (
    <>
      <Message>
        Voting ends <b>{new Date(votingEnds).toLocaleString()}</b>
      </Message>
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
            />
          )
        })}
      </Grid>
      {suggestedArrays.sameRegion && (
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
            />
          )
        })}
      </Grid>
      {suggestedArrays.otherRegion && (
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
                />
              )
            })}
          </Grid>
        </>
      )}
      <Button
        disabled={
          Object.keys(votes).length !==
          data.usersForVoting.users.length +
            data.usersForVoting.suggested.length
        }
        positive
        style={{ marginTop: "2em" }}
        onClick={handleSubmit}
      >
        Submit
      </Button>
      <span style={{ marginLeft: "2em" }} onClick={() => randomizeVotes()}>
        Randomize
      </span>
    </>
  )
}

export default Voting
