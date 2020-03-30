import { gql, DocumentNode } from "apollo-boost"
import { DetailedTeamInfo } from "../../types"

export interface SearchForDraftCupData {
  searchForDraftCup: {
    tournament: {
      name: string
      bracket_url: string
      date: string
      top_3_team_names: string[]
      top_3_discord_users: {
        username: string
        discriminator: string
        twitter_name?: string
        discord_id: string
      }[][]
      participant_discord_ids: [string]
      type: "DRAFTONE" | "DRAFTTWO"
    }
    matches: {
      round_name: string
      round_number: number
      map_details: {
        stage: string
        mode: "TW" | "SZ" | "TC" | "RM" | "CB"
        duration: number
        winners: DetailedTeamInfo
        losers: DetailedTeamInfo
      }[]
    }[]
  }
}

export interface SearchForDraftCupVars {
  name: string
}

export const SEARCH_FOR_DRAFT_CUP: DocumentNode = gql`
  query searchForDraftCup($name: String!) {
    searchForDraftCup(name: $name) {
      tournament {
        name
        bracket_url
        date
        top_3_team_names
        top_3_discord_users {
          username
          discriminator
          twitter_name
          discord_id
        }
        participant_discord_ids
        type
      }
      matches {
        round_name
        round_number
        map_details {
          stage
          mode
          duration
          winners {
            ...teamInfoFields
          }
          losers {
            ...teamInfoFields
          }
        }
      }
    }
  }

  fragment teamInfoFields on TeamInfo {
    team_name
    score
    players {
      discord_user {
        username
        discriminator
        twitter_name
        discord_id
      }
      weapon
      main_abilities
      sub_abilities
      kills
      assists
      deaths
      specials
      paint
      gear
    }
  }
`
