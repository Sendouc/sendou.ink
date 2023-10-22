import type { ColumnType, GeneratedAlways } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface AllTeam {
  avatarImgId: number | null;
  bannerImgId: number | null;
  bio: string | null;
  createdAt: Generated<number>;
  css: string | null;
  customUrl: string;
  deletedAt: number | null;
  id: number | null;
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

export interface Art {
  authorId: number;
  createdAt: Generated<number>;
  description: string | null;
  id: number | null;
  imgId: number;
  isShowcase: Generated<number>;
}

export interface ArtTag {
  authorId: number;
  createdAt: Generated<number>;
  id: number | null;
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
  id: number | null;
}
// export type SelectableBadge = Selectable<Badge>;

export interface BadgeManager {
  badgeId: number;
  userId: number;
}

// xxx: is it possible to exclude views from inserts/deletes?
export type BadgeOwner = {
  badgeId: number | null;
  userId: number | null;
};

export interface Build {
  clothesGearSplId: number;
  description: string | null;
  headGearSplId: number;
  id: number | null;
  modes: string | null;
  ownerId: number;
  private: Generated<number | null>;
  shoesGearSplId: number;
  title: string;
  updatedAt: Generated<number>;
}

export interface BuildAbility {
  ability: string;
  buildId: number;
  gearType: string;
  slotIndex: number;
}

export interface BuildWeapon {
  buildId: number;
  weaponSplId: number;
}

export interface CalendarEvent {
  authorId: number;
  bracketUrl: string;
  description: string | null;
  discordInviteCode: string | null;
  id: number | null;
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
  id: number | null;
  startTime: number;
}

export interface CalendarEventResultPlayer {
  name: string | null;
  teamId: number;
  userId: number | null;
}

export interface CalendarEventResultTeam {
  eventId: number;
  id: number | null;
  name: string;
  placement: number;
}

export interface FreshPlusTier {
  tier: string | null;
  userId: number | null;
}

export interface Group {
  chatCode: string | null;
  createdAt: Generated<number>;
  id: number | null;
  inviteCode: string;
  latestActionAt: Generated<number>;
  mapListPreference: string;
  status: string;
  teamId: number | null;
}

export interface GroupLike {
  createdAt: Generated<number>;
  likerGroupId: number;
  targetGroupId: number;
}

export interface GroupMatch {
  alphaGroupId: number;
  bravoGroupId: number;
  chatCode: string | null;
  createdAt: Generated<number>;
  id: number | null;
  memento: string | null;
  reportedAt: number | null;
  reportedByUserId: number | null;
}

export interface GroupMatchMap {
  id: number | null;
  index: number;
  matchId: number;
  mode: string;
  source: string;
  stageId: number;
  winnerGroupId: number | null;
}

export interface GroupMember {
  createdAt: Generated<number>;
  groupId: number;
  note: string | null;
  role: string;
  userId: number;
}

export interface LogInLink {
  code: string;
  expiresAt: number;
  userId: number;
}

export interface MapPoolMap {
  calendarEventId: number | null;
  groupId: number | null;
  mode: string;
  stageId: number;
  tieBreakerCalendarEventId: number | null;
  tournamentTeamId: number | null;
}

export interface MapResult {
  losses: number;
  mode: string;
  season: number;
  stageId: number;
  userId: number;
  wins: number;
}

export interface Migrations {
  created_at: string;
  id: number | null;
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
  createdAt: Generated<number>;
  id: number | null;
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
  month: number | null;
  passedVoting: string | null;
  score: string | null;
  tier: number | null;
  votedId: number | null;
  wasSuggested: string | null;
  year: number | null;
}

export interface ReportedWeapon {
  groupMatchMapId: number | null;
  userId: number;
  weaponSplId: number;
}

export interface Skill {
  groupMatchId: number | null;
  id: number | null;
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
  id: number | null;
  splId: string;
  userId: number | null;
}

export interface TaggedArt {
  artId: number;
  tagId: number;
}

export interface Team {
  avatarImgId: number | null;
  bannerImgId: number | null;
  bio: string | null;
  createdAt: number | null;
  css: string | null;
  customUrl: string | null;
  deletedAt: number | null;
  id: number | null;
  inviteCode: string | null;
  name: string | null;
  twitter: string | null;
}

export interface TeamMember {
  createdAt: number | null;
  isOwner: number | null;
  leftAt: number | null;
  role: string | null;
  teamId: number | null;
  userId: number | null;
}

export interface Tournament {
  format: string;
  id: number | null;
  mapPickingStyle: string;
  showMapListGenerator: Generated<number | null>;
}

export interface TournamentBadgeOwner {
  badgeId: number;
  userId: number;
}

export interface TournamentGroup {
  id: number | null;
  number: number;
  stageId: number;
}

export interface TournamentMatch {
  bestOf: Generated<number>;
  chatCode: string | null;
  childCount: number;
  groupId: number;
  id: number | null;
  number: number;
  opponentOne: string;
  opponentTwo: string;
  roundId: number;
  stageId: number;
  status: number;
}

export interface TournamentMatchGameResult {
  createdAt: Generated<number>;
  id: number | null;
  matchId: number;
  mode: string;
  number: number;
  reporterId: number;
  source: string;
  stageId: number;
  winnerTeamId: number;
}

export interface TournamentMatchGameResultParticipant {
  matchGameResultId: number;
  userId: number;
}

export interface TournamentResult {
  isHighlight: Generated<number>;
  participantCount: number;
  placement: number;
  tournamentId: number;
  tournamentTeamId: number;
  userId: number;
}

export interface TournamentRound {
  groupId: number;
  id: number | null;
  number: number;
  stageId: number;
}

export interface TournamentStage {
  id: number | null;
  name: string;
  number: number;
  settings: string;
  tournamentId: number;
  type: string;
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

export interface TournamentTeam {
  createdAt: Generated<number>;
  id: number | null;
  inviteCode: string;
  name: string;
  prefersNotToHost: Generated<number>;
  seed: number | null;
  tournamentId: number;
}

export interface TournamentTeamCheckIn {
  checkedInAt: number;
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
  id: number | null;
  submitterUserId: number;
  url: string;
  validatedAt: number | null;
}

export interface UnvalidatedVideo {
  eventId: number | null;
  id: number | null;
  submitterUserId: number;
  title: string;
  type: string;
  validatedAt: number | null;
  youtubeDate: number;
  youtubeId: string;
}

export interface User {
  banned: Generated<number | null>;
  bio: string | null;
  commissionsOpen: Generated<number | null>;
  commissionText: string | null;
  country: string | null;
  css: string | null;
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
  vc: Generated<string | null>;
  youtubeId: string | null;
}

export interface UserResultHighlight {
  teamId: number;
  userId: number;
}

export interface UserSubmittedImage {
  id: number | null;
  submitterUserId: number | null;
  url: string | null;
  validatedAt: number | null;
}

export interface UserWeapon {
  createdAt: Generated<number>;
  isFavorite: Generated<number>;
  order: number;
  userId: number;
  weaponSplId: number;
}

export interface Video {
  eventId: number | null;
  id: number | null;
  submitterUserId: number | null;
  title: string | null;
  type: string | null;
  validatedAt: number | null;
  youtubeDate: number | null;
  youtubeId: string | null;
}

export interface VideoMatch {
  id: number | null;
  mode: string;
  stageId: number;
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
  id: number | null;
  mode: string;
  month: number;
  name: string;
  nameDiscriminator: string;
  playerId: number;
  power: number;
  rank: number;
  region: string;
  title: string;
  weaponSplId: number;
  year: number;
}

// xxx: Selectable?
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
  Video: Video;
  VideoMatch: VideoMatch;
  VideoMatchPlayer: VideoMatchPlayer;
  XRankPlacement: XRankPlacement;
}
