import { DocumentNode, gql } from "@apollo/client"

export interface XTrendsData {
  xTrends: {
    weapon: string
    counts: {
      year: number
      SZ: (null | number)[]
      TC: (null | number)[]
      RM: (null | number)[]
      CB: (null | number)[]
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
