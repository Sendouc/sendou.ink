import { gql } from "apollo-boost"

export const addVouch = gql`
  mutation addVouch($discord_id: String!, $server: String!, $region: String!) {
    addVouch(discord_id: $discord_id, server: $server, region: $region)
  }
`
