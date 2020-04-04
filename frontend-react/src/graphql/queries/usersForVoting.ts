import { gql, DocumentNode } from "apollo-boost"

export interface VotingSuggested {
  discord_user: {
    discord_id: string
    username: string
    discriminator: string
    twitter_name?: string
  }
  suggester_discord_user: {
    username: string
    discriminator: string
  }
  plus_region: "EU" | "NA"
  description: string
}

export interface UsersForVotingData {
  usersForVoting: {
    users: {
      username: string
      discriminator: string
      twitter_name?: string
      discord_id: string
      plus: {
        membership_status?: "ONE" | "TWO"
        vouch_status?: "ONE" | "TWO"
        plus_region: "EU" | "NA"
      }
    }[]
    suggested: VotingSuggested[]
    votes: {
      discord_id: string
      score: number
      month: number
      year: number
    }[]
  }
}

export const USERS_FOR_VOTING: DocumentNode = gql`
  {
    usersForVoting {
      users {
        username
        discriminator
        twitter_name
        discord_id
        plus {
          membership_status
          vouch_status
          plus_region
        }
      }
      suggested {
        discord_user {
          discord_id
          username
          discriminator
          twitter_name
        }
        suggester_discord_user {
          username
          discriminator
        }
        plus_region
        description
      }
      votes {
        discord_id
        score
        month
        year
      }
    }
  }
`
