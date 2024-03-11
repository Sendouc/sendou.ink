import type {
  ColumnType,
  GeneratedAlways,
  Insertable,
  Selectable,
  SqlBool,
} from "kysely";
import type { TieredSkill } from "~/features/mmr/tiered.server";
import type {
  Ability,
  MainWeaponId,
  ModeShort,
  StageId,
} from "~/modules/in-game-lists";
import type { GroupSkillDifference, UserSkillDifference } from "./types";
import type { ParticipantResult } from "~/modules/brackets-model";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export interface AllTeam {
  avatarImgId: number | null;
  bannerImgId: number | null;
  bio: string | null;
  createdAt: Generated<number>;
  css: ColumnType<Record<string, string> | null, string | null, string | null>;
  customUrl: string;
  deletedAt: number | null;
  id: GeneratedAlways<number>;
  inviteCode: string;
  name: string;
  twitter: string | null;
}

export interface AllTeamMember {
  createdAt: Generated<number>;
  isOwner: Generated<number>;
  leftAt: number | null;
  role: string | null;
  teamId: number;
  userId: number;
}

export interface Team {
  avatarImgId: number | null;
  bannerImgId: number | null;
  bio: string | null;
  createdAt: number | null;
  css: ColumnType<Record<string, string> | null, string | null, string | null>;
  customUrl: string;
  deletedAt: number | null;
  id: GeneratedAlways<number>;
  inviteCode: string;
  name: string;
  twitter: string | null;
}

export interface TeamMember {
  createdAt: number | null;
  isOwner: number | null;
  leftAt: number | null;
  role: string | null;
  teamId: number;
  userId: number;
}

export interface Art {
  authorId: number;
  createdAt: Generated<number>;
  description: string | null;
  id: GeneratedAlways<number>;
  imgId: number;
  isShowcase: Generated<number>;
}

export interface ArtTag {
  authorId: number;
  createdAt: Generated<number>;
  id: GeneratedAlways<number>;
  name: string;
}

export interface ArtUserMetadata {
  artId: number;
  userId: number;
}

export interface Badge {
  code: string;
  displayName: string;
  hue: number | null;
  id: GeneratedAlways<number>;
}
// export type SelectableBadge = Selectable<Badge>;

export interface BadgeManager {
  badgeId: number;
  userId: number;
}

export type BadgeOwner = {
  badgeId: number | null;
  userId: number | null;
};

export interface Build {
  clothesGearSplId: number;
  description: string | null;
  headGearSplId: number;
  id: GeneratedAlways<number>;
  modes: ColumnType<ModeShort[] | null, string | null, string | null>;
  ownerId: number;
  private: number | null;
  shoesGearSplId: number;
  title: string;
  updatedAt: Generated<number>;
}

export interface BuildAbility {
  ability: Ability;
  buildId: number;
  gearType: string;
  slotIndex: number;
}

export interface BuildWeapon {
  buildId: number;
  weaponSplId: MainWeaponId;
}

export interface CalendarEvent {
  authorId: number;
  bracketUrl: string;
  description: string | null;
  discordInviteCode: string | null;
  id: GeneratedAlways<number>;
  discordUrl: GeneratedAlways<string | null>;
  name: string;
  participantCount: number | null;
  tags: string | null;
  tournamentId: number | null;
}

export interface CalendarEventBadge {
  badgeId: number;
  eventId: number;
}

export interface CalendarEventDate {
  eventId: number;
  id: GeneratedAlways<number>;
  startTime: number;
}

export interface CalendarEventResultPlayer {
  name: string | null;
  teamId: number;
  userId: number | null;
}

export interface CalendarEventResultTeam {
  eventId: number;
  id: GeneratedAlways<number>;
  name: string;
  placement: number;
}

export interface FreshPlusTier {
  tier: number | null;
  userId: number;
}

export interface Group {
  chatCode: string | null;
  createdAt: Generated<number>;
  id: GeneratedAlways<number>;
  inviteCode: string;
  latestActionAt: Generated<number>;
  status: "PREPARING" | "ACTIVE" | "INACTIVE";
  teamId: number | null;
}

export interface GroupLike {
  createdAt: Generated<number>;
  likerGroupId: number;
  targetGroupId: number;
  isRechallenge: number | null;
}

export type ParsedMemento = {
  users: Record<
    number,
    {
      plusTier?: PlusTier["tier"];
      skill?: TieredSkill | "CALCULATING";
      skillDifference?: UserSkillDifference;
    }
  >;
  groups: Record<
    number,
    {
      tier?: TieredSkill["tier"];
      skillDifference?: GroupSkillDifference;
    }
  >;
  modePreferences?: Partial<
    Record<ModeShort, Array<{ userId: number; preference?: Preference }>>
  >;
  /** mapPreferences of season 2 */
  mapPreferences?: Array<{ userId: number; preference?: Preference }[]>;
  pools: Array<{ userId: number; pool: UserMapModePreferences["pool"] }>;
};

export interface GroupMatch {
  alphaGroupId: number;
  bravoGroupId: number;
  chatCode: string | null;
  createdAt: Generated<number>;
  id: GeneratedAlways<number>;
  memento: ColumnType<ParsedMemento | null, string | null, string | null>;
  reportedAt: number | null;
  reportedByUserId: number | null;
}

export interface GroupMatchMap {
  id: GeneratedAlways<number>;
  index: number;
  matchId: number;
  mode: ModeShort;
  source: string;
  stageId: StageId;
  winnerGroupId: number | null;
}

export interface GroupMember {
  createdAt: Generated<number>;
  groupId: number;
  note: string | null;
  role: "OWNER" | "MANAGER" | "REGULAR";
  userId: number;
}

export interface PrivateUserNote {
  authorId: number;
  targetId: number;
  text: string | null;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  updatedAt: Generated<number>;
}

export interface LogInLink {
  code: string;
  expiresAt: number;
  userId: number;
}

export interface MapPoolMap {
  calendarEventId: number | null;
  mode: ModeShort;
  stageId: StageId;
  tieBreakerCalendarEventId: number | null;
  tournamentTeamId: number | null;
}

export interface MapResult {
  losses: number;
  mode: ModeShort;
  season: number;
  stageId: StageId;
  userId: number;
  wins: number;
}

export interface Migrations {
  created_at: string;
  id: GeneratedAlways<number>;
  name: string;
}

export interface PlayerResult {
  mapLosses: number;
  mapWins: number;
  otherUserId: number;
  ownerUserId: number;
  season: number;
  setLosses: number;
  setWins: number;
  type: string;
}

export interface PlusSuggestion {
  authorId: number;
  createdAt: GeneratedAlways<number>;
  id: GeneratedAlways<number>;
  month: number;
  suggestedId: number;
  text: string;
  tier: number;
  year: number;
}

export interface PlusTier {
  tier: number;
  userId: number | null;
}

export interface PlusVote {
  authorId: number;
  month: number;
  score: number;
  tier: number;
  validAfter: number;
  votedId: number;
  year: number;
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

export interface ReportedWeapon {
  groupMatchMapId: number | null;
  userId: number;
  weaponSplId: number;
}

export interface Skill {
  groupMatchId: number | null;
  id: GeneratedAlways<number>;
  identifier: string | null;
  matchesCount: number;
  mu: number;
  ordinal: number;
  season: number;
  sigma: number;
  tournamentId: number | null;
  userId: number | null;
}

export interface SkillTeamUser {
  skillId: number;
  userId: number;
}

export interface SplatoonPlayer {
  id: GeneratedAlways<number>;
  splId: string;
  userId: number | null;
}

export interface TaggedArt {
  artId: number;
  tagId: number;
}

// AUTO = style where teams pick their map pool ahead of time and the map lists are automatically made for each round
// could also have the traditional style where TO picks the maps later
type TournamentMapPickingStyle =
  | "TO"
  | "AUTO_ALL"
  | "AUTO_SZ"
  | "AUTO_TC"
  | "AUTO_RM"
  | "AUTO_CB";

export type TournamentBracketProgression = {
  type: TournamentStage["type"];
  name: string;
  /** Where do the teams come from? If missing then it means the source is the full registered teams list. */
  sources?: {
    /** Index of the bracket where the teams come from */
    bracketIdx: number;
    /** Team placements that join this bracket. E.g. [1, 2] would mean top 1 & 2 teams. [-1] would mean the last placing teams. */
    placements: number[];
  }[];
}[];

export interface TournamentSettings {
  bracketProgression: TournamentBracketProgression;
  teamsPerGroup?: number;
  thirdPlaceMatch?: boolean;
  isRanked?: boolean;
  autoCheckInAll?: boolean;
}

export interface CastedMatchesInfo {
  /** Array for match ID's that are locked because they are pending to be casted */
  lockedMatches: number[];
  /** What matches are streamed currently & where */
  castedMatches: { twitchAccount: string; matchId: number }[];
}

export interface Tournament {
  settings: ColumnType<TournamentSettings, string, string>;
  id: GeneratedAlways<number>;
  mapPickingStyle: TournamentMapPickingStyle;
  showMapListGenerator: Generated<number | null>;
  castTwitchAccounts: ColumnType<string[] | null, string | null, string | null>;
  castedMatchesInfo: ColumnType<
    CastedMatchesInfo | null,
    string | null,
    string | null
  >;
}

export interface TournamentBadgeOwner {
  badgeId: number;
  userId: number;
}

export interface TournamentGroup {
  id: GeneratedAlways<number>;
  number: number;
  stageId: number;
}

export interface TournamentMatch {
  // TODO: remove
  bestOf: Generated<3 | 5 | 7>;
  chatCode: string | null;
  groupId: number;
  id: GeneratedAlways<number>;
  number: number;
  opponentOne: ColumnType<ParticipantResult, string, string>;
  opponentTwo: ColumnType<ParticipantResult, string, string>;
  roundId: number;
  stageId: number;
  status: number;
}

export interface TournamentMatchGameResult {
  createdAt: Generated<number>;
  id: GeneratedAlways<number>;
  matchId: number;
  mode: ModeShort;
  number: number;
  reporterId: number;
  source: string;
  stageId: StageId;
  winnerTeamId: number;
  opponentOnePoints: number | null;
  opponentTwoPoints: number | null;
}

export interface TournamentMatchGameResultParticipant {
  matchGameResultId: number;
  userId: number;
}

export interface TournamentResult {
  isHighlight: Generated<SqlBool>;
  participantCount: number;
  placement: number;
  tournamentId: number;
  tournamentTeamId: number;
  userId: number;
}

export interface TournamentRoundMaps {
  list?: Array<{ mode: ModeShort; stageId: StageId }> | null;
  count: number;
  // TODO: support play_all
  type: "BEST_OF";
  // TODO: counterpick style
}

export interface TournamentRound {
  groupId: number;
  id: GeneratedAlways<number>;
  number: number;
  stageId: number;
  maps: ColumnType<TournamentRoundMaps | null, string | null, string | null>;
}

export interface TournamentStage {
  id: GeneratedAlways<number>;
  name: string;
  number: number;
  settings: string;
  tournamentId: number;
  type: "double_elimination" | "single_elimination" | "round_robin";
  // not Generated<> because SQLite doesn't allow altering tables to add columns with default values :(
  createdAt: number | null;
}

export interface TournamentSub {
  bestWeapons: string;
  canVc: number;
  createdAt: Generated<number>;
  message: string | null;
  okWeapons: string | null;
  tournamentId: number;
  userId: number;
  visibility: string;
}

export interface TournamentStaff {
  tournamentId: number;
  userId: number;
  role: "ORGANIZER" | "STREAMER";
}

export interface TournamentTeam {
  createdAt: Generated<number>;
  id: GeneratedAlways<number>;
  inviteCode: string;
  name: string;
  prefersNotToHost: Generated<number>;
  seed: number | null;
  tournamentId: number;
}

export interface TournamentTeamCheckIn {
  checkedInAt: number;
  /** Which bracket checked in for. If missing is check in for the whole event. */
  bracketIdx: number | null;
  tournamentTeamId: number;
}

export interface TournamentTeamMember {
  createdAt: Generated<number>;
  isOwner: Generated<number>;
  tournamentTeamId: number;
  userId: number;
}

export interface TrustRelationship {
  trustGiverUserId: number;
  trustReceiverUserId: number;
}

export interface UnvalidatedUserSubmittedImage {
  id: GeneratedAlways<number>;
  submitterUserId: number;
  url: string;
  validatedAt: number | null;
}

export interface UnvalidatedVideo {
  eventId: number | null;
  id: GeneratedAlways<number>;
  submitterUserId: number;
  title: string;
  type: string;
  validatedAt: number | null;
  youtubeDate: number;
  youtubeId: string;
}

// missing means "neutral"
export type Preference = "AVOID" | "PREFER";
export interface UserMapModePreferences {
  modes: Array<{
    mode: ModeShort;
    preference?: Preference;
  }>;
  pool: Array<{
    mode: ModeShort;
    stages: StageId[];
  }>;
}

export interface User {
  banned: Generated<number | null>;
  bio: string | null;
  commissionsOpen: Generated<number | null>;
  commissionText: string | null;
  country: string | null;
  css: ColumnType<Record<string, string> | null, string | null, string | null>;
  customUrl: string | null;
  discordAvatar: string | null;
  discordDiscriminator: string;
  discordId: string;
  discordName: string;
  discordUniqueName: string | null;
  favoriteBadgeId: number | null;
  id: GeneratedAlways<number>;
  inGameName: string | null;
  isArtist: Generated<number | null>;
  isVideoAdder: Generated<number | null>;
  languages: string | null;
  motionSens: number | null;
  patronSince: number | null;
  patronTier: number | null;
  patronTill: number | null;
  showDiscordUniqueName: Generated<number>;
  stickSens: number | null;
  twitch: string | null;
  twitter: string | null;
  vc: Generated<"YES" | "NO" | "LISTEN_ONLY">;
  youtubeId: string | null;
  mapModePreferences: ColumnType<
    UserMapModePreferences | null,
    string | null,
    string | null
  >;
  qWeaponPool: ColumnType<MainWeaponId[] | null, string | null, string | null>;
  plusSkippedForSeasonNth: number | null;
  noScreen: Generated<number>;
}

export interface UserResultHighlight {
  teamId: number;
  userId: number;
}

export interface UserSubmittedImage {
  id: GeneratedAlways<number>;
  submitterUserId: number | null;
  url: string | null;
  validatedAt: number | null;
}

export interface UserWeapon {
  createdAt: Generated<number>;
  isFavorite: Generated<number>;
  order: number;
  userId: number;
  weaponSplId: MainWeaponId;
}

export interface UserFriendCode {
  friendCode: string;
  userId: number;
  submitterUserId: number;
  createdAt: GeneratedAlways<number>;
}

export interface Video {
  eventId: number | null;
  id: GeneratedAlways<number>;
  submitterUserId: number | null;
  title: string | null;
  type: string | null;
  validatedAt: number | null;
  youtubeDate: number | null;
  youtubeId: string | null;
}

export interface VideoMatch {
  id: GeneratedAlways<number>;
  mode: ModeShort;
  stageId: StageId;
  startsAt: number;
  videoId: number;
}

export interface VideoMatchPlayer {
  player: number;
  playerName: string | null;
  playerUserId: number | null;
  videoMatchId: number;
  weaponSplId: number;
}

export interface XRankPlacement {
  badges: string;
  bannerSplId: number;
  id: GeneratedAlways<number>;
  mode: ModeShort;
  month: number;
  name: string;
  nameDiscriminator: string;
  playerId: number;
  power: number;
  rank: number;
  region: string;
  title: string;
  weaponSplId: MainWeaponId;
  year: number;
}

export type Tables = { [P in keyof DB]: Selectable<DB[P]> };
export type TablesInsertable = { [P in keyof DB]: Insertable<DB[P]> };

export interface DB {
  AllTeam: AllTeam;
  AllTeamMember: AllTeamMember;
  Art: Art;
  ArtTag: ArtTag;
  ArtUserMetadata: ArtUserMetadata;
  Badge: Badge;
  BadgeManager: BadgeManager;
  BadgeOwner: BadgeOwner;
  Build: Build;
  BuildAbility: BuildAbility;
  BuildWeapon: BuildWeapon;
  CalendarEvent: CalendarEvent;
  CalendarEventBadge: CalendarEventBadge;
  CalendarEventDate: CalendarEventDate;
  CalendarEventResultPlayer: CalendarEventResultPlayer;
  CalendarEventResultTeam: CalendarEventResultTeam;
  FreshPlusTier: FreshPlusTier;
  Group: Group;
  GroupLike: GroupLike;
  GroupMatch: GroupMatch;
  GroupMatchMap: GroupMatchMap;
  GroupMember: GroupMember;
  PrivateUserNote: PrivateUserNote;
  LogInLink: LogInLink;
  MapPoolMap: MapPoolMap;
  MapResult: MapResult;
  migrations: Migrations;
  PlayerResult: PlayerResult;
  PlusSuggestion: PlusSuggestion;
  PlusTier: PlusTier;
  PlusVote: PlusVote;
  PlusVotingResult: PlusVotingResult;
  ReportedWeapon: ReportedWeapon;
  Skill: Skill;
  SkillTeamUser: SkillTeamUser;
  SplatoonPlayer: SplatoonPlayer;
  TaggedArt: TaggedArt;
  Team: Team;
  TeamMember: TeamMember;
  Tournament: Tournament;
  TournamentStaff: TournamentStaff;
  TournamentBadgeOwner: TournamentBadgeOwner;
  TournamentGroup: TournamentGroup;
  TournamentMatch: TournamentMatch;
  TournamentMatchGameResult: TournamentMatchGameResult;
  TournamentMatchGameResultParticipant: TournamentMatchGameResultParticipant;
  TournamentResult: TournamentResult;
  TournamentRound: TournamentRound;
  TournamentStage: TournamentStage;
  TournamentSub: TournamentSub;
  TournamentTeam: TournamentTeam;
  TournamentTeamCheckIn: TournamentTeamCheckIn;
  TournamentTeamMember: TournamentTeamMember;
  TrustRelationship: TrustRelationship;
  UnvalidatedUserSubmittedImage: UnvalidatedUserSubmittedImage;
  UnvalidatedVideo: UnvalidatedVideo;
  User: User;
  UserResultHighlight: UserResultHighlight;
  UserSubmittedImage: UserSubmittedImage;
  UserWeapon: UserWeapon;
  UserFriendCode: UserFriendCode;
  Video: Video;
  VideoMatch: VideoMatch;
  VideoMatchPlayer: VideoMatchPlayer;
  XRankPlacement: XRankPlacement;
}
