import { DocumentNode, gql } from "@apollo/client";

export const SEARCH_FOR_BUILDS: DocumentNode = gql`
  query searchForBuilds($discord_id: String, $weapon: String) {
    searchForBuilds(discord_id: $discord_id, weapon: $weapon) {
      id
      weapon
      title
      description
      headgear
      headgearItem
      clothing
      clothingItem
      shoes
      shoesItem
      updatedAt
      top
      jpn
      discord_user {
        username
        discriminator
        discord_id
      }
    }
  }
`;
