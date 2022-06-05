export interface User {
  id: number;
  discordId: string;
  discordName: string;
  discordDiscriminator: string;
  discordAvatar: string | null;
  twitch: string | null;
  twitter: string | null;
  youtubeId: string | null;
  bio: string | null;
  country: string | null;
}

/** User table after joined with PlusTier table */
export interface UserWithPlusTier extends User {
  plusTier: PlusTier["tier"] | null;
}

export interface PlusSuggestion {
  id: number;
  text: string;
  authorId: number;
  suggestedId: number;
  month: number;
  year: number;
  tier: number;
  createdAt: number;
}

export interface PlusVote {
  month: number;
  year: number;
  tier: number;
  authorId: number;
  votedId: number;
  score: number;
  validAfter: number;
}

export interface PlusVotingResult {
  votedId: number;
  tier: number;
  score: number;
  month: number;
  year: number;
  wasSuggested: number;
  passedVoting: number;
}

export interface PlusTier {
  userId: number;
  tier: number;
}
