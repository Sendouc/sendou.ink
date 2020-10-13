import { DocumentNode, gql } from "@apollo/client";

export interface VotingSuggested {
  discord_user: {
    discord_id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    bio?: string;
  };
  suggester_discord_user: {
    username: string;
    discriminator: string;
  };
  plus_region: "EU" | "NA";
  description: string;
}

export interface Vote {
  discord_id: string;
  score: number;
  month: number;
  year: number;
  stale: boolean;
}

export interface UsersForVotingData {
  usersForVoting: {
    users: {
      username: string;
      discriminator: string;
      avatar?: string;
      discord_id: string;
      bio?: string;
      plus: {
        membership_status?: "ONE" | "TWO";
        vouch_status?: "ONE" | "TWO";
        plus_region: "EU" | "NA";
      };
    }[];
    suggested: VotingSuggested[];
    votes: Vote[];
  };
}

export const USERS_FOR_VOTING: DocumentNode = gql`
  {
    usersForVoting {
      users {
        username
        discriminator
        avatar
        discord_id
        bio
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
          avatar
          bio
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
        stale
      }
    }
  }
`;
