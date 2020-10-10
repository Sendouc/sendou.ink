import { DocumentNode, gql } from "@apollo/client";

export const DELETE_BUILD: DocumentNode = gql`
  mutation deleteBuild($id: ID!) {
    deleteBuild(id: $id)
  }
`;
