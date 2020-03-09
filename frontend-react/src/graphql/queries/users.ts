import { gql, DocumentNode } from "apollo-boost"

export const USERS: DocumentNode = gql`
  {
    users {
      username
      discriminator
      discord_id
      twitter_name
    }
  }
`
