import { gql } from "apollo-boost"

export const searchForBuildsByWeapon = gql`
  query searchForBuildsByWeapon($weapon: String, $page: Int) {
    searchForBuildsByWeapon(weapon: $weapon, page: $page) {
      builds {
        id
        discord_id
        top
        weapon
        headgear
        headgearItem
        clothing
        clothingItem
        shoes
        shoesItem
        title
        description
        updatedAt
        discord_user {
          username
          discriminator
        }
      }
      pageCount
    }
  }
`
