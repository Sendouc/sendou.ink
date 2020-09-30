import { DocumentNode, gql } from "@apollo/client";

export const LINKS: DocumentNode = gql`
  {
    links {
      title
      url
      description
      type
    }
  }
`;
