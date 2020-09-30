import { DocumentNode, gql } from "@apollo/client";

export const PLAYER_INFO: DocumentNode = gql`
  query playerInfo($twitter: String) {
    playerInfo(twitter: $twitter) {
      placements {
        id
        weapon
        rank
        mode
        x_power
        month
        year
      }
    }
  }
`;
