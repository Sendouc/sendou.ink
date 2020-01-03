import { gql } from "apollo-boost"

export const plusInfo = gql`
  {
    plusInfo {
      plus_one_invite_link
      plus_two_invite_link
      voting_ends
      voter_count
      eligible_voters
    }
  }
`
