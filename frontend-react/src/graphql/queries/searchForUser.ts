import { gql, DocumentNode } from "apollo-boost"

export const SEARCH_FOR_USER: DocumentNode = gql`
  query searchForUser($discord_id: String, $custom_url: String) {
    searchForUser(discord_id: $discord_id, custom_url: $custom_url) {
      id
      username
      discriminator
      discord_id
      twitch_name
      twitter_name
      country
      weapons
      top500
      custom_url
      sens {
        stick
        motion
      }
    }
  }
`
