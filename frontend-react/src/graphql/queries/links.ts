import { gql, DocumentNode } from "apollo-boost"

export const LINKS: DocumentNode = gql`
  {
    links {
      title
      url
      description
      type
    }
  }
`
