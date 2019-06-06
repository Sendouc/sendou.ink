import { gql } from 'apollo-boost'

export const addBuild = gql`
mutation addBuild ($weapon: String!, $title: String, $headgear: [Ability!]!, $clothing: [Ability!]!, $shoes: [Ability!]!) {
   addBuild(
     weapon: $weapon,
     title: $title,
     headgear: $headgear,
     clothing: $clothing,
     shoes: $shoes
   ) {
     id
     weapon
     title
     headgear
     clothing
     shoes
     createdAt
   }
}
`