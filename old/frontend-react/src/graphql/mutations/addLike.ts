import { DocumentNode, gql } from "@apollo/client";

export const ADD_LIKE: DocumentNode = gql`
  mutation addLike($discord_id: String!) {
    addLike(discord_id: $discord_id)
  }
`;
