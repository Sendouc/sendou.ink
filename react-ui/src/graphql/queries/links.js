import { gql } from "apollo-boost"

export const links = gql`
  {
    links {
      title
      url
      description
      type
    }
  }
`
