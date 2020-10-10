import { DocumentNode, gql } from "@apollo/client";

interface Placement {
  id: string;
  mode: number;
  name: string;
  player?: {
    discord_id?: string;
  };
  rank: number;
  unique_id: string;
  weapon: string;
  x_power: number;
  month: number;
  year: number;
}

export interface SearchForPlacementsData {
  searchForPlacements: {
    placements: Placement[];
    pageCount: number;
  };
}

export interface SearchForPlacementsVars {
  page?: number;
  name?: string;
  weapon?: string;
  mode?: number;
  unique_id?: string;
  month?: number;
  year?: number;
}

export const SEARCH_FOR_PLACEMENTS: DocumentNode = gql`
  query searchForPlacements(
    $name: String
    $weapon: String
    $mode: Int
    $unique_id: String
    $month: Int
    $year: Int
    $page: Int
  ) {
    searchForPlacements(
      name: $name
      weapon: $weapon
      mode: $mode
      unique_id: $unique_id
      month: $month
      year: $year
      page: $page
    ) {
      placements {
        name
        x_power
        weapon
        rank
        id
        unique_id
        month
        year
        mode
        player {
          discord_id
        }
      }
      pageCount
    }
  }
`;
