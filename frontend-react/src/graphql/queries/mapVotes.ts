import { DocumentNode, gql } from "@apollo/client"

export interface MapVotesData {
  mapVotes: {
    name: string
    sz: -1 | 0 | 1
    tc: -1 | 0 | 1
    rm: -1 | 0 | 1
    cb: -1 | 0 | 1
  }[]
}

export const MAP_VOTES: DocumentNode = gql`
  {
    mapVotes {
      name
      sz
      tc
      rm
      cb
    }
  }
`
