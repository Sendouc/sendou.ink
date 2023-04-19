import type { TEAM_MEMBER_ROLES } from "~/features/team";
import type {
  Ability,
  MainWeaponId,
  ModeShort,
  RankedModeShort,
  StageId,
} from "~/modules/in-game-lists";
import type allTags from "../routes/calendar/tags.json";

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
  css: string | null;
  country: string | null;
  customUrl: string | null;
  stickSens: number | null;
  motionSens: number | null;
  inGameName: string | null;
  patronTier: number | null;
  patronSince: number | null;
  /** Used to overwrite normal patron giving process and force give the patron status till this date */
  patronTill: number | null;
  isVideoAdder: number;
}

/** User table after joined with PlusTier table */
export interface UserWithPlusTier extends User {
  plusTier: PlusTier["tier"] | null;
}

export interface UserWeapon {
  userId: number;
  weaponSplId: MainWeaponId;
  createdAt: number;
  order: number;
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
  tags: string | null;
  description: string | null;
  discordInviteCode: string | null;
  // generated column
  discordUrl: string | null;
  bracketUrl: string;
  participantCount: number | null;
  customUrl: string | null;
  /** Is tournament tools page visible */
  toToolsEnabled: number;
  toToolsMode: RankedModeShort | null;
  isBeforeStart: number;
}

export type CalendarEventTag = keyof typeof allTags;

export interface CalendarEventDate {
  id: number;
  eventId: number;
  startTime: number;
}

export interface CalendarEventResultTeam {
  id: number;
  eventId: number;
  name: string;
  placement: number;
}

export interface CalendarEventResultPlayer {
  teamId: number;
  userId: number | null;
  name: string | null;
}

export interface CalendarEventBadge {
  eventId: number;
  badgeId: number;
}

export interface Build {
  id: number;
  ownerId: number;
  title: string;
  description: string | null;
  modes: string | null;
  headGearSplId: number;
  clothesGearSplId: number;
  shoesGearSplId: number;
  updatedAt: number;
}

export interface BuildWeapon {
  buildId: number;
  weaponSplId: MainWeaponId;
}

export type GearType = "HEAD" | "CLOTHES" | "SHOES";

export interface BuildAbility {
  buildId: number;
  gearType: "HEAD" | "CLOTHES" | "SHOES";
  ability: Ability;
  slotIndex: 0 | 1 | 2 | 3;
  abilityPoints: number; // 3 or 10
}

export interface MapPoolMap {
  calendarEventId: number | null; // Part of tournament's map pool
  tournamentTeamId: number | null; // Part of team's map pool
  tieBreakerCalendarEventId: number | null; // Part of the tournament's tiebreaker pool
  stageId: StageId;
  mode: ModeShort;
}

export interface TournamentTeam {
  id: number;
  // TODO: make non-nullable in database as well
  name: string;
  createdAt: number;
  seed: number | null;
  calendarEventId: number;
  inviteCode: string;
  checkedInAt?: number;
}

export interface TournamentTeamMember {
  tournamentTeamId: number;
  userId: number;
  isOwner: number;
  createdAt: number;
}

export type BracketType = "SE" | "DE";

export interface TournamentBracket {
  id: number;
  calendarEventId: number;
  type: BracketType;
}

export interface TournamentRound {
  id: number;
  // position of the round 1 for Round 1, 2 for Round 2, -1 for Losers Round 1 etc.
  position: number;
  bracketId: number;
  bestOf: number;
}

export interface TournamentMatch {
  id: number;
  roundId: number;
  // TODO tournament: why we need both?
  number: number | null;
  position: number;
  winnerDestinationMatchId: number | null;
  loserDestinationMatchId: number | null;
}

export type TeamOrder = "UPPER" | "LOWER";

export interface TournamentMatchParticipant {
  order: TeamOrder;
  teamId: number;
  matchId: number;
}

export interface TournamentMatchGameResult {
  id: number;
  matchId: number;
  stageId: StageId;
  mode: ModeShort;
  winnerTeamId: number;
  reporterId: number;
  createdAt: number;
}

export interface UserSubmittedImage {
  id: number;
  validatedAt: number | null;
  url: string;
  submitterUserId: number;
}

export interface Team {
  id: number;
  name: string;
  customUrl: string;
  inviteCode: string;
  css: string | null;
  twitter: string | null;
  bio: string | null;
  avatarImgId: number | null;
  bannerImgId: number | null;
  createdAt: number;
  deletedAt: number | null;
}

export type MemberRole = (typeof TEAM_MEMBER_ROLES)[number];

export interface TeamMember {
  teamId: number;
  userId: number;
  role: MemberRole | null;
  isOwner: number;
  createdAt: number;
  leftAt: number | null;
}

export interface Video {
  id: number;
  title: string;
  type: "SCRIM" | "TOURNAMENT" | "MATCHMAKING" | "CAST";
  youtubeDate: number;
  eventId: number | null;
  youtubeId: string;
  submitterUserId: number;
  validatedAt: number | null;
}

export interface VideoMatch {
  id: number;
  videoId: number;
  startsAt: number;
  stageId: StageId;
  mode: ModeShort;
}

export interface VideoMatchPlayer {
  videoMatchId: number;
  playerUserId: number | null;
  playerName: string | null;
  weaponSplId: MainWeaponId;
  player: number;
}

export interface XRankPlacement {
  id: number;
  weaponSplId: MainWeaponId;
  name: string;
  nameDiscriminator: string;
  power: number;
  rank: number;
  title: string;
  badges: string; // badge id's separated by comma
  bannerSplId: number;
  playerId: number;
  month: number;
  year: number;
  mode: RankedModeShort;
  region: "WEST" | "JPN";
}

export interface SplatoonPlayer {
  id: number;
  userId: number;
  splId: string;
}
