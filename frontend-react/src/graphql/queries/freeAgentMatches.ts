import { gql, DocumentNode } from "apollo-boost"

export interface FreeAgentMatchesData {
  freeAgentMatches: {
    matched_discord_users: {
      username: string
      discriminator: string
      twitter_name?: string
    }[]
    number_of_likes_received: number
    liked_discord_ids: string[]
  }
}

export const FREE_AGENT_MATCHES: DocumentNode = gql`
  {
    freeAgentMatches {
      matched_discord_users {
        username
        discriminator
        twitter_name
      }
      number_of_likes_received
      liked_discord_ids
    }
  }
`
