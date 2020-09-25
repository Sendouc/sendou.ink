import { DocumentNode, gql } from "@apollo/client"

export const ADD_VOUCH: DocumentNode = gql`
  mutation addVouch($discord_id: String!, $server: String!, $region: String!) {
    addVouch(discord_id: $discord_id, server: $server, region: $region)
  }
`
