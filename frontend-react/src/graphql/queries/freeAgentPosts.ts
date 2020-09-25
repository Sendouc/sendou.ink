import { DocumentNode, gql } from "@apollo/client"

export const FREE_AGENT_POSTS: DocumentNode = gql`
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
        avatar
      }
    }
  }
`
