import { DocumentNode, gql } from "@apollo/client"

export const END_VOTING: DocumentNode = gql`
  mutation {
    endVoting
  }
`
