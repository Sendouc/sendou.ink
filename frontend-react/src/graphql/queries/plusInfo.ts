import { DocumentNode, gql } from "@apollo/client";

export interface PlusInfoData {
  plusInfo?: {
    voting_ends?: string;
    voter_count: number;
    eligible_voters: number;
  };
}

export const PLUS_INFO: DocumentNode = gql`
  {
    plusInfo {
      voting_ends
      voter_count
      eligible_voters
    }
  }
`;
