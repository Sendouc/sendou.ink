import { DocumentNode, gql } from "@apollo/client"

export interface AddMapVotesVars {
  votes: {
    name: string
    sz: -1 | 0 | 1
    tc: -1 | 0 | 1
    rm: -1 | 0 | 1
    cb: -1 | 0 | 1
  }[]
}

export const ADD_MAP_VOTES: DocumentNode = gql`
  mutation addMapVotes($votes: [MapVoteInput!]!) {
    addMapVotes(votes: $votes)
  }
`
