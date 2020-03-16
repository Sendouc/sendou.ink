import { gql } from "apollo-boost"

export const updateTwitter = gql`
  mutation updateTwitter($unique_id: String!, $twitter: String!) {
    updateTwitter(unique_id: $unique_id, twitter: $twitter)
  }
`
