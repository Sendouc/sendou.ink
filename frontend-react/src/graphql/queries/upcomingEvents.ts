import { gql, DocumentNode } from "apollo-boost"
import { User } from "../../types"

export interface UpcomingEventsData {
  upcomingEvents: {
    name: string
    date: string
    description: string
    message_url: string
    discord_invite_url: string
    picture_url?: string
    poster_discord_user: {
      username: string
      discriminator: string
      twitter_name?: string
      discord_id: string
    }
  }[]
}

export const SEARCH_FOR_USER: DocumentNode = gql`
  {
    upcomingEvents {
      name
      date
      description
      message_url
      discord_invite_url
      picture_url
      poster_discord_user {
        username
        discriminator
        twitter_name
        discord_id
      }
    }
  }
`
