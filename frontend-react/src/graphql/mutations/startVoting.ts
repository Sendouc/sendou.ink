import { DocumentNode, gql } from "@apollo/client"

export interface StartVotingVars {
  ends: string
}

export const START_VOTING: DocumentNode = gql`
  mutation startVoting($ends: String!) {
    startVoting(ends: $ends)
  }
`
