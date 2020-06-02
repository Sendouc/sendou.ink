import { gql, DocumentNode } from "apollo-boost"

export const VOUCHES: DocumentNode = gql`
  {
    vouches {
      username
      discriminator
      twitter_name
      discord_id
      avatar
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
