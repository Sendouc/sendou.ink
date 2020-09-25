import { DocumentNode, gql } from "@apollo/client"

export interface Suggestion {
  discord_user: {
    discord_id: string
    username: string
    discriminator: string
    avatar?: string
  }
  suggester_discord_user: {
    discord_id: string
    username: string
    discriminator: string
  }
  plus_server: "ONE" | "TWO"
  plus_region: "NA" | "EU"
  description: string
  createdAt: string
}

export interface SuggestionsData {
  suggestions: Suggestion[]
}

export const SUGGESTIONS: DocumentNode = gql`
  {
    suggestions {
      discord_user {
        discord_id
        username
        discriminator
        twitter_name
        avatar
      }
      suggester_discord_user {
        discord_id
        username
        discriminator
      }
      plus_server
      plus_region
      description
      createdAt
    }
  }
`
