import { gql, DocumentNode } from "apollo-boost"

export interface AddVotesVars {
  votes: {
    discord_id: string
    score: -2 | -1 | 1 | 2
  }[]
}

export const ADD_VOTES: DocumentNode = gql`
  mutation addVotes($votes: [VoteInput!]!) {
    addVotes(votes: $votes)
  }
`
