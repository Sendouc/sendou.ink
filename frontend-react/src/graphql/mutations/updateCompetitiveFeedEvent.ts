import { DocumentNode, gql } from "@apollo/client"

export interface UpdateCompetitiveFeedEventVars {
  event: {
    name: string
    date: string
    description: string
    message_discord_id: string
    discord_invite_url: string
    picture_url?: string
  }
}

export const UPDATE_COMPETITIVE_FEED_EVENT: DocumentNode = gql`
  mutation updateCompetitiveFeedEvent(
    $event: UpdateCompetitiveFeedEventInput!
  ) {
    updateCompetitiveFeedEvent(event: $event)
  }
`
