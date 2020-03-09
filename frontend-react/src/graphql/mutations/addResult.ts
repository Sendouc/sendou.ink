import { gql, DocumentNode } from "apollo-boost"

export const ADD_RESULT: DocumentNode = gql`
  mutation addResult(
    $date: String!
    $tweet_id: String
    $tournament_name: String!
    $placement: Int!
  ) {
    addResult(
      date: $date
      tweet_id: $tweet_id
      tournament_name: $tournament_name
      placement: $placement
    )
  }
`
