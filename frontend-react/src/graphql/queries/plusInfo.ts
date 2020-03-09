import { gql, DocumentNode } from "apollo-boost"

export const PLUS_INFO: DocumentNode = gql`
  {
    plusInfo {
      voting_ends
      voter_count
      eligible_voters
    }
  }
`
