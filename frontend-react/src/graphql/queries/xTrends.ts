import { gql, DocumentNode } from "apollo-boost"

export interface XTrendsData {
  xTrends: {
    weapon: string
    counts: {
      year: number
      SZ: number[]
      TC: number[]
      RM: number[]
      CB: number[]
    }[]
  }[]
}

export const X_TRENDS: DocumentNode = gql`
  query xTrends {
    xTrends {
      weapon
      counts {
        year
        SZ
        TC
        RM
        CB
      }
    }
  }
`
