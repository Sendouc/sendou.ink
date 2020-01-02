import { gql } from "apollo-boost"

export const startVoting = gql`
  mutation startVoting($ends: String!) {
    startVoting(ends: $ends)
  }
`
