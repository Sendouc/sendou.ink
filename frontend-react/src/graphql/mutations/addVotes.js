import { gql } from "apollo-boost"

export const addVotes = gql`
  mutation addVotes($votes: [VoteInput!]!) {
    addVotes(votes: $votes)
  }
`
