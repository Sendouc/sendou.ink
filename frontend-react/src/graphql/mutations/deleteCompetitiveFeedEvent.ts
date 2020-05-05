import { gql, DocumentNode } from "apollo-boost"

export interface DeleteCompetitiveFeedEventVars {
  message_discord_id: string
}

export const DELETE_COMPETITIVE_FEED_EVENT: DocumentNode = gql`
  mutation deleteCompetitiveFeedEvent($message_discord_id: String!) {
    deleteCompetitiveFeedEvent(message_discord_id: $message_discord_id)
  }
`
