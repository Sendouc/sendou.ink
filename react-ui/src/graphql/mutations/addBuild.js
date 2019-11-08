import { gql } from "apollo-boost"

export const addBuild = gql`
  mutation addBuild(
    $weapon: String!
    $title: String
    $description: String
    $headgear: [Ability!]!
    $headgearItem: String
    $clothing: [Ability!]!
    $clothingItem: String
    $shoes: [Ability!]!
    $shoesItem: String
  ) {
    addBuild(
      weapon: $weapon
      title: $title
      description: $description
      headgear: $headgear
      headgearItem: $headgearItem
      clothing: $clothing
      clothingItem: $clothingItem
      shoes: $shoes
      shoesItem: $shoesItem
    ) {
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
    }
  }
`
