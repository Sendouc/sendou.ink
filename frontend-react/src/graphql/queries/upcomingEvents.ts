import { gql, DocumentNode } from "apollo-boost"

export interface CompetitiveFeedEvent {
  name: string
  date: string
  description: string
  message_url: string
  message_discord_id: string
  discord_invite_url: string
  picture_url?: string
  poster_discord_user: {
    username: string
    discriminator: string
    twitter_name?: string
    discord_id: string
  }
}

export interface UpcomingEventsData {
  upcomingEvents: CompetitiveFeedEvent[]
}

export const UPCOMING_EVENTS: DocumentNode = gql`
  {
    upcomingEvents {
      name
      date
      description
      message_discord_id
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
