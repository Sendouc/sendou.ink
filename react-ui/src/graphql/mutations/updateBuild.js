import { gql } from 'apollo-boost'

export const updateBuild = gql`
mutation updateBuild ($id: ID!, $weapon: String!, $title: String, $headgear: [Ability!]!, $clothing: [Ability!]!, $shoes: [Ability!]!) {
  updateBuild(
     id: $id,
     weapon: $weapon,
     title: $title,
     headgear: $headgear,
     clothing: $clothing,
     shoes: $shoes
   )
}
`