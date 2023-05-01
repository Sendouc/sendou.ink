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
  favoriteBadgeId: number | null;
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
  tournamentId: number | null;
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
  /** Private builds are only visible on the user builds page to the owner only */
  private: number;
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

// AUTO = style where teams pick their map pool ahead of time and the map lists are automatically made for each round
// could also have the traditional style where TO picks the maps later
type TournamentMapPickingStyle =
  | "AUTO_ALL"
  | "AUTO_SZ"
  | "AUTO_TC"
  | "AUTO_RM"
  | "AUTO_CB";

// TODO: later also e.g. RR_TO_DE where we also need an additional field
// describing how many teams advance
export type TournamentFormat = "SE" | "DE";

// xxx: isBeforeStart not working with this
export interface Tournament {
  id: number;
  mapPickingStyle: TournamentMapPickingStyle;
  format: TournamentFormat;
}

export interface TournamentTeam {
  id: number;
  name: string;
  createdAt: number;
  seed: number | null;
  tournamentId: number;
  inviteCode: string;
  checkedInAt?: number;
}

export interface TournamentTeamMember {
  tournamentTeamId: number;
  userId: number;
  isOwner: number;
  createdAt: number;
}

/** A stage is an intermediate phase in a tournament.
 * Supported stage types are round-robin, single elimination and double elimination. */
export interface TournamentStage {
  id: number;
  tournamentId: number;
  name: string;
  type: "round_robin" | "single_elimination" | "double_elimination";
  settings: string; // json
  number: number;
}

/** A group is a logical structure used to group multiple rounds together.

- In round-robin stages, a group is a pool.
- In elimination stages, a group is a bracket.
    - A single elimination stage can have one or two groups:
      - The unique bracket.
      - If enabled, the Consolation Final.
    - A double elimination stage can have two or three groups:
      - Upper and lower brackets.
      - If enabled, the Grand Final. */
export interface TournamentGroup {
  id: number;
  stageId: number;
  /** In double elimination 1 = Winners, 2 = Losers, 3 = Grand Finals */
  number: number;
}

/** 
 * A round is a logical structure used to group multiple matches together.

  - In round-robin stages, a round can be viewed as a day or just as a list of matches that can be played at the same time.
  - In elimination stages, a round is a round of a bracket, e.g. 8th finals, semi-finals, etc.
 */
export interface TournamentRound {
  id: number;
  stageId: number;
  groupId: number;
  number: number;
}

/** A match between two participants (more participants are not allowed).
 * Participants can be teams or individuals. */
export interface TournamentMatch {
  id: number;
  /** Not used */
  childCount: number;
  bestOf: 3 | 5 | 7;
  roundId: number;
  stageId: number;
  groupId: number;
  number: number;
  opponentOne: string; // json
  opponentTwo: string; // json
  status: number;
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

export interface TournamentMatchGameResultParticipant {
  matchGameResultId: number;
  userId: number;
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
