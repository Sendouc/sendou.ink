import { gql, DocumentNode } from "apollo-boost"

export interface PlusDraftCupsData {
  plusDraftCups: {
    tournaments: {
      name: string
      top_3_team_names: string[]
      top_3_discord_users: {
        username: string
        discriminator: string
        twitter_name?: string
      }[][]
      bracket_url: string
      date: string
      type: "DRAFTONE" | "DRAFTTWO"
    }[]
    leaderboards: {
      players: {
        discord_user: {
          username: string
          discord_id: string
          discriminator: string
          twitter_name?: string
        }
        first: number
        second: number
        third: number
        score: number
      }[]
      type: "DRAFTONE" | "DRAFTTWO"
    }[]
  }
}

export const PLUS_DRAFT_CUPS: DocumentNode = gql`
  {
    plusDraftCups {
      tournaments {
        name
        top_3_team_names
        top_3_discord_users {
          username
          discriminator
          twitter_name
        }
        bracket_url
        date
        type
      }
      leaderboards {
        players {
          discord_user {
            username
            discord_id
            discriminator
            twitter_name
          }
          first
          second
          third
          score
        }
        type
      }
    }
  }
`
