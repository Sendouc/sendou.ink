import { gql } from "apollo-boost"

export const addSuggestion = gql`
  mutation addSuggestion(
    $discord_id: String!
    $region: String!
    $server: String!
    $description: String!
  ) {
    addSuggestion(
      discord_id: $discord_id
      region: $region
      server: $server
      description: $description
    )
  }
`
