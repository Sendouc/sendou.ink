import { gql } from "apollo-boost"

export const userLean = gql`
  {
    user {
      id
      username
      twitter_name
      discord_id
      custom_url
      plus {
        membership_status
        plus_region
        vouch_status
      }
    }
  }
`
