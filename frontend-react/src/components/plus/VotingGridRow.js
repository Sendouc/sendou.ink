import React from "react"
import { Divider, Grid } from "semantic-ui-react"
import VotingNumber from "./VotingNumber"
import UserAvatar from "../common/UserAvatar"
import { Link } from "react-router-dom"

const VotingGridRow = ({
  votes,
  setVotes,
  user,
  suggester,
  description,
  sameRegion = true,
}) => {
  return (
    <>
      <Grid.Row columns={5}>
        <Grid.Column style={{ wordWrap: "normal" }}>
          <Link
            to={`/u/${user.discord_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <UserAvatar twitterName={user.twitter_name} />
            {user.username}#{user.discriminator}
          </Link>
        </Grid.Column>
        <Grid.Column>
          {sameRegion && (
            <VotingNumber
              number={-2}
              selected={votes[user.discord_id] === -2}
              onClick={() => setVotes({ ...votes, [user.discord_id]: -2 })}
            />
          )}
        </Grid.Column>
        <Grid.Column>
          <VotingNumber
            number={-1}
            selected={votes[user.discord_id] === -1}
            onClick={() => setVotes({ ...votes, [user.discord_id]: -1 })}
          />
        </Grid.Column>
        <Grid.Column>
          <VotingNumber
            number={1}
            selected={votes[user.discord_id] === 1}
            onClick={() => setVotes({ ...votes, [user.discord_id]: 1 })}
          />
        </Grid.Column>
        <Grid.Column>
          {sameRegion && (
            <VotingNumber
              number={2}
              selected={votes[user.discord_id] === 2}
              onClick={() => setVotes({ ...votes, [user.discord_id]: 2 })}
            />
          )}
        </Grid.Column>
      </Grid.Row>
      {suggester ? (
        <div style={{ margin: "0.5em 0 0.5em 0" }}>
          <b>
            Suggested by{" "}
            <Link
              to={`/u/${suggester.discord_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {suggester.username}#{suggester.discriminator}
            </Link>
          </b>
          <div>{description}</div>
        </div>
      ) : (
        <Divider />
      )}
    </>
  )
}

export default VotingGridRow
