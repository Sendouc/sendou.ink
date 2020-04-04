import { gql, DocumentNode } from "apollo-boost"

export interface StartVotingVars {
  ends: string
}

export const START_VOTING: DocumentNode = gql`
  mutation startVoting($ends: String!) {
    startVoting(ends: $ends)
  }
`
