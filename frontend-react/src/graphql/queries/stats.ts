import { gql, DocumentNode } from "apollo-boost"

export const STATS: DocumentNode = gql`
  {
    stats {
      build_count
      tournament_count
      fa_count
      user_count
    }
  }
`
