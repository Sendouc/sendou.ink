import { DocumentNode, gql } from "@apollo/client";

export const DELETE_LIKE: DocumentNode = gql`
  mutation deleteLike($discord_id: String!) {
    deleteLike(discord_id: $discord_id)
  }
`;
