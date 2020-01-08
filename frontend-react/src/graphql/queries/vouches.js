import { gql } from "apollo-boost"

export const vouches = gql`
  {
    vouches {
      username
      discriminator
      twitter_name
      discord_id
      plus {
        voucher_user {
          username
          discriminator
          discord_id
        }
        vouch_status
      }
    }
  }
`
