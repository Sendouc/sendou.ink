import { gql } from "@apollo/client"

export const maplists = gql`
  {
    maplists {
      name
      sz
      tc
      rm
      cb
    }
  }
`
