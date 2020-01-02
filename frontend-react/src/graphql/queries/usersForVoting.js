import { gql } from "apollo-boost"

export const usersForVoting = gql`
  {
    usersForVoting {
      users {
        username
        discriminator
        twitter_name
        discord_id
        plus {
          membership_status
          vouch_status
          plus_region
        }
      }
      suggested {
        discord_user {
          discord_id
          username
          discriminator
          twitter_name
        }
        suggester_discord_user {
          username
          discriminator
        }
        plus_region
        description
      }
      votes {
        discord_id
        score
      }
    }
  }
`
