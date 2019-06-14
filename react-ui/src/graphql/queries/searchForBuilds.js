import { gql } from 'apollo-boost'

export const searchForBuilds = gql`
query searchForBuilds($discord_id: String!) {
  searchForBuilds(discord_id: $discord_id) {
    id
    weapon
    title
    headgear
    clothing
    shoes
    createdAt
    top
  }
}
`