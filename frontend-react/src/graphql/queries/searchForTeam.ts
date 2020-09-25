import { DocumentNode, gql } from "@apollo/client"

export const SEARCH_FOR_TEAM: DocumentNode = gql`
  query searchForTeam($name: String!) {
    searchForTeam(name: $name) {
      name
      twitter_name
      challonge_name
      discord_url
      founded {
        month
        year
      }
      captain_discord_id
      member_discord_ids
      member_users {
        discord_id
        username
        discriminator
        twitch_name
        twitter_name
        country
        weapons
        custom_url
      }
      countries
      tag
      lf_post
      tournament_results {
        date
        tweet_id
        tournament_name
        placement
      }
    }
  }
`
