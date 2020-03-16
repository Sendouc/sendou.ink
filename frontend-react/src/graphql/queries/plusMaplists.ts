import { gql, DocumentNode } from "apollo-boost"
import { Stage } from "../../types"

export interface PlusMaplistsData {
  plusMaplists: {
    name: string
    sz: Stage[]
    tc: Stage[]
    rm: Stage[]
    cb: Stage[]
    plus: {
      month: number
      year: number
      voter_count: number
      vote_counts: {
        name: Stage
        sz: number[]
        tc: number[]
        rm: number[]
        cb: number[]
      }[]
    }
  }[]
}

export const PLUS_MAPLISTS: DocumentNode = gql`
  {
    plusMaplists {
      name
      sz
      tc
      rm
      cb
      plus {
        month
        year
        voter_count
        vote_counts {
          name
          sz
          tc
          rm
          cb
        }
      }
    }
  }
`
