import { gql, DocumentNode } from "apollo-boost"

export const SEARCH_FOR_BUILDS: DocumentNode = gql`
  query searchForBuilds($discord_id: String!) {
    searchForBuilds(discord_id: $discord_id) {
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
    }
  }
`
