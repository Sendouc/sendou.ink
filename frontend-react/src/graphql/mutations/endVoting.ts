import { gql, DocumentNode } from "apollo-boost"

export const END_VOTING: DocumentNode = gql`
  mutation {
    endVoting
  }
`
