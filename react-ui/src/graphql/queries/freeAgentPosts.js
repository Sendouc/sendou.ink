import { gql } from "apollo-boost"

export const freeAgentPosts = gql`
  {
    freeAgentPosts {
      id
      can_vc
      playstyles
      activity
      looking_for
      past_experience
      description
      hidden
      createdAt
      discord_user {
        username
        discriminator
        discord_id
        twitter_name
        country
        weapons
        top500
      }
    }
  }
`
