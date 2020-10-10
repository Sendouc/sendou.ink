import { DocumentNode, gql } from "@apollo/client";

export const USER: DocumentNode = gql`
  {
    user {
      id
      username
      twitter_name
      avatar
      discord_id
      custom_url
      plus {
        membership_status
        plus_region
        vouch_status
        can_vouch
        can_vouch_again_after
      }
    }
  }
`;
