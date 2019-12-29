import { gql } from "apollo-boost"

export const userLean = gql`
  {
    user {
      id
      username
      twitter_name
      discord_id
      plus {
        membership_status
      }
    }
  }
`
