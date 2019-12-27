import { gql } from "apollo-boost"

export const users = gql`
  {
    users {
      username
      discriminator
      twitter_name
      discord_id
    }
  }
`
