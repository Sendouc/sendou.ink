import { DocumentNode, gql } from "@apollo/client"

export interface UpdateTwitterVars {
  unique_id: string
  twitter: string
}

export const UPDATE_TWITTER: DocumentNode = gql`
  mutation updateTwitter($unique_id: String!, $twitter: String!) {
    updateTwitter(unique_id: $unique_id, twitter: $twitter)
  }
`
