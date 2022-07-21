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
  patronTier: number | null;
  patronSince: number | null;
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

export interface Badge {
  id: number;
  code: string;
  displayName: string;
  hue?: number;
}

/** View that is union of TournamentBadgeOwner and Patreon badges */
export interface BadgeOwner {
  badgeId: number;
  userId: number;
}

export interface TournamentBadgeOwner {
  badgeId: number;
  userId: number;
}

export interface BadgeManager {
  badgeId: number;
  userId: number;
}

export interface CalendarEvent {
  id: number;
  name: string;
  authorId: number;
  description: string | null;
  discordUrl: string | null;
  bracketUrl: string | null;
  participantCount: number | null;
}

export interface CalendarEventDate {
  eventId: number;
  startTime: number;
}

export interface CalendarEventWinner {
  eventId: number;
  teamName: string;
  placement: number;
  userId: number | null;
  name: string | null;
}

export interface CalendarEventBadge {
  eventId: number;
  badgeId: number;
}
