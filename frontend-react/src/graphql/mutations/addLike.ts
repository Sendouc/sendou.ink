import { gql, DocumentNode } from "apollo-boost"

export const ADD_LIKE: DocumentNode = gql`
  mutation addLike($discord_id: String!) {
    addLike(discord_id: $discord_id)
  }
`
