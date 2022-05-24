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
  // xxx: problem with "votes that you don't have to end"... can we calcualte dynamically?
  plusTier: number | null;
}

export interface PlusSuggestion {
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
}
