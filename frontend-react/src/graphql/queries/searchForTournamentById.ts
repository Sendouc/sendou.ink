import { gql, DocumentNode } from "apollo-boost"
import { Weapon, Ability } from "../../types"

export interface SearchForTournamentByIdVars {
  id: string
}

export interface SearchForTournamentByIdData {
  searchForTournamentById?: {
    id: string
    name: string
    jpn: boolean
    google_sheet_url?: string
    bracket?: string
    date: string
    popular_weapons: string[]
    winning_team_name: string
    winning_team_players: string[]
    rounds: {
      stage: string
      mode: "SZ" | "TC" | "RM" | "CB" | "TW"
      round_name: string
      round_number: number
      game_number: number
      winning_team_name: string
      winning_team_players: string[]
      winning_team_weapons: Weapon[]
      winning_team_main_abilities: Ability[][]
      losing_team_name: string
      losing_team_players: string[]
      losing_team_weapons: Weapon[]
      losing_team_main_abilities: Ability[][]
    }[]
  }
}

export const SEARCH_FOR_TOURNAMENT_BY_ID: DocumentNode = gql`
  query searchForTournamentById($id: String!) {
    searchForTournamentById(id: $id) {
      name
      jpn
      google_sheet_url
      bracket
      date
      popular_weapons
      winning_team_name
      winning_team_players
      rounds {
        stage
        mode
        round_name
        round_number
        game_number
        winning_team_name
        winning_team_players
        winning_team_weapons
        winning_team_main_abilities
        losing_team_name
        losing_team_players
        losing_team_weapons
        losing_team_main_abilities
      }
    }
  }
`
