import { gql } from "apollo-boost"

export const searchForBuilds = gql`
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
