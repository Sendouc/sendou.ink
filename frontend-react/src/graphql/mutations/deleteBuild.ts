import { gql, DocumentNode } from "apollo-boost"

export const DELETE_BUILD: DocumentNode = gql`
  mutation deleteBuild($id: ID!) {
    deleteBuild(id: $id)
  }
`
