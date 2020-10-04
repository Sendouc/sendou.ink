import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  searchForBuilds: Array<Build>;
  maplists: Array<Maplist>;
  plusMaplists: Array<Maplist>;
  mapVotes?: Maybe<Array<MapVote>>;
  positiveVotes?: Maybe<Scalars['Boolean']>;
  getXRankPlacements: PaginatedXRankPlacements;
  getXRankLeaderboard: PaginatedXRankLeaderboard;
  getPeakXPowerLeaderboard: PaginatedXRankPlacements;
  playerCount: Scalars['Int'];
  topTotalPlayers: Array<Player>;
  topShooterPlayers: Array<Player>;
  topBlasterPlayers: Array<Player>;
  topRollerPlayers: Array<Player>;
  topChargerPlayers: Array<Player>;
  topSlosherPlayers: Array<Player>;
  topSplatlingPlayers: Array<Player>;
  topDualiesPlayers: Array<Player>;
  topBrellaPlayers: Array<Player>;
  topFlex: Array<Player>;
  rotationData?: Maybe<Scalars['String']>;
  /** Returns the current logged in user or null if not logged in. */
  user?: Maybe<User>;
  /** Returns user. Either discord_id or twitter has to provided or error is thrown. */
  searchForUser?: Maybe<User>;
  /** Returns all users */
  users: Array<User>;
  /** Get user by sendou.ink ID, Discord ID or custom URL path. */
  getUserByIdentifier?: Maybe<NewUser>;
  links: Array<Link>;
  xTrends: Array<Trend>;
  searchForTournamentById?: Maybe<Tournament>;
  searchForTournaments: TournamentCollection;
  plusDraftCups: DraftCupCollection;
  searchForDraftCup: DraftCupDetailCollection;
  upcomingEvents: Array<CompetitiveFeedEvent>;
  freeAgentPosts: Array<FaPost>;
  freeAgentMatches: FaMatches;
  plusInfo?: Maybe<PlusGeneralInfo>;
  hasAccess?: Maybe<Scalars['String']>;
  xPowers: Array<Maybe<Scalars['Int']>>;
  suggestions?: Maybe<Array<Suggested>>;
  vouches?: Maybe<Array<User>>;
  usersForVoting: UsersForVoting;
  summaries?: Maybe<Array<Summary>>;
  searchForTeam?: Maybe<Team>;
  teams: Array<Team>;
  stats?: Maybe<Stats>;
  banners: Array<Banner>;
};


export type QuerySearchForBuildsArgs = {
  discord_id?: Maybe<Scalars['String']>;
  weapon?: Maybe<Scalars['String']>;
};


export type QueryMaplistsArgs = {
  name?: Maybe<Scalars['String']>;
};


export type QueryPositiveVotesArgs = {
  mode?: Maybe<Mode>;
};


export type QueryGetXRankPlacementsArgs = {
  page?: Maybe<Scalars['Int']>;
  filter?: Maybe<GetXRankPlacementsInput>;
};


export type QueryGetXRankLeaderboardArgs = {
  page?: Maybe<Scalars['Int']>;
  type: XRankLeaderboardType;
};


export type QueryGetPeakXPowerLeaderboardArgs = {
  page?: Maybe<Scalars['Int']>;
  weapon?: Maybe<Scalars['String']>;
};


export type QueryTopTotalPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopShooterPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopBlasterPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopRollerPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopChargerPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopSlosherPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopSplatlingPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopDualiesPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QueryTopBrellaPlayersArgs = {
  amount?: Maybe<Scalars['Int']>;
};


export type QuerySearchForUserArgs = {
  discord_id?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  custom_url?: Maybe<Scalars['String']>;
};


export type QueryGetUserByIdentifierArgs = {
  identifier: Scalars['String'];
};


export type QuerySearchForTournamentByIdArgs = {
  id: Scalars['String'];
};


export type QuerySearchForTournamentsArgs = {
  tournament_name?: Maybe<Scalars['String']>;
  region?: Maybe<Region>;
  player_name?: Maybe<Scalars['String']>;
  unique_id?: Maybe<Scalars['String']>;
  team_name?: Maybe<Scalars['String']>;
  comp?: Maybe<Array<Maybe<Scalars['String']>>>;
  stage?: Maybe<Scalars['String']>;
  mode?: Maybe<Mode>;
  page?: Maybe<Scalars['Int']>;
};


export type QuerySearchForDraftCupArgs = {
  name: Scalars['String'];
};


export type QueryHasAccessArgs = {
  discord_id: Scalars['String'];
};


export type QueryXPowersArgs = {
  discord_id: Scalars['String'];
};


export type QuerySearchForTeamArgs = {
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']>;
  addBuild?: Maybe<Build>;
  deleteBuild?: Maybe<Scalars['Boolean']>;
  updateBuild?: Maybe<Scalars['Boolean']>;
  addMapVotes?: Maybe<Scalars['Boolean']>;
  generateMaplistFromVotes?: Maybe<Scalars['Boolean']>;
  updateTwitter?: Maybe<Scalars['Boolean']>;
  updateUser?: Maybe<Scalars['Boolean']>;
  updateAvatars?: Maybe<Scalars['Boolean']>;
  addDetailedTournament: Scalars['Boolean'];
  addPrivateBattles: Scalars['Int'];
  replaceDraftLeaderboard: Scalars['Boolean'];
  addCompetitiveFeedEvent: Scalars['Boolean'];
  updateCompetitiveFeedEvent: Scalars['Boolean'];
  deleteCompetitiveFeedEvent: Scalars['Boolean'];
  addFreeAgentPost: Scalars['Boolean'];
  hideFreeAgentPost: Scalars['Boolean'];
  updateFreeAgentPost: Scalars['Boolean'];
  addLike: Scalars['Boolean'];
  deleteLike: Scalars['Boolean'];
  addSuggestion: Scalars['Boolean'];
  addVouch: Scalars['Boolean'];
  addVotes: Scalars['Boolean'];
  startVoting: Scalars['Boolean'];
  endVoting: Scalars['Boolean'];
  addTeam: Scalars['Boolean'];
  joinTeam: Scalars['Boolean'];
  resetInviteCode: Scalars['String'];
  leaveTeam: Scalars['Boolean'];
  disbandTeam: Scalars['Boolean'];
};


export type MutationAddBuildArgs = {
  weapon: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  headgear: Array<Ability>;
  headgearItem?: Maybe<Scalars['String']>;
  clothing: Array<Ability>;
  clothingItem?: Maybe<Scalars['String']>;
  shoes: Array<Ability>;
  shoesItem?: Maybe<Scalars['String']>;
};


export type MutationDeleteBuildArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateBuildArgs = {
  id: Scalars['ID'];
  weapon: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  headgear: Array<Ability>;
  headgearItem?: Maybe<Scalars['String']>;
  clothing: Array<Ability>;
  clothingItem?: Maybe<Scalars['String']>;
  shoes: Array<Ability>;
  shoesItem?: Maybe<Scalars['String']>;
};


export type MutationAddMapVotesArgs = {
  votes: Array<MapVoteInput>;
};


export type MutationUpdateTwitterArgs = {
  unique_id: Scalars['String'];
  twitter: Scalars['String'];
};


export type MutationUpdateUserArgs = {
  country?: Maybe<Scalars['String']>;
  motion_sens?: Maybe<Scalars['Float']>;
  stick_sens?: Maybe<Scalars['Float']>;
  weapons?: Maybe<Array<Scalars['String']>>;
  custom_url?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
};


export type MutationUpdateAvatarsArgs = {
  lohiToken: Scalars['String'];
  toUpdate: Array<DiscordIdAvatar>;
};


export type MutationAddDetailedTournamentArgs = {
  plus_server: PlusServer;
  tournament: DetailedTournamentInput;
  matches: Array<DetailedMatchInput>;
  lanistaToken: Scalars['String'];
};


export type MutationAddPrivateBattlesArgs = {
  submitterDiscordId: Scalars['String'];
  maps: Array<DetailedMapInput>;
  lanistaToken: Scalars['String'];
};


export type MutationReplaceDraftLeaderboardArgs = {
  plus_server: PlusServer;
  players: Array<TournamentPlayerInput>;
};


export type MutationAddCompetitiveFeedEventArgs = {
  event: CompetitiveFeedEventInput;
  lohiToken: Scalars['String'];
};


export type MutationUpdateCompetitiveFeedEventArgs = {
  event: UpdateCompetitiveFeedEventInput;
};


export type MutationDeleteCompetitiveFeedEventArgs = {
  message_discord_id: Scalars['String'];
};


export type MutationAddFreeAgentPostArgs = {
  can_vc: CanVc;
  playstyles: Array<Playstyle>;
  activity?: Maybe<Scalars['String']>;
  looking_for?: Maybe<Scalars['String']>;
  past_experience?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};


export type MutationUpdateFreeAgentPostArgs = {
  can_vc: CanVc;
  playstyles: Array<Playstyle>;
  activity?: Maybe<Scalars['String']>;
  looking_for?: Maybe<Scalars['String']>;
  past_experience?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};


export type MutationAddLikeArgs = {
  discord_id: Scalars['String'];
};


export type MutationDeleteLikeArgs = {
  discord_id: Scalars['String'];
};


export type MutationAddSuggestionArgs = {
  discord_id: Scalars['String'];
  server: Scalars['String'];
  region: Scalars['String'];
  description: Scalars['String'];
};


export type MutationAddVouchArgs = {
  discord_id: Scalars['String'];
  server: Scalars['String'];
  region: Scalars['String'];
};


export type MutationAddVotesArgs = {
  votes: Array<VoteInput>;
};


export type MutationStartVotingArgs = {
  ends: Scalars['String'];
};


export type MutationAddTeamArgs = {
  name: Scalars['String'];
};


export type MutationJoinTeamArgs = {
  inviteCode: Scalars['String'];
};

export type Build = {
  __typename?: 'Build';
  id: Scalars['ID'];
  discord_id: Scalars['String'];
  weapon: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  headgear: Array<Ability>;
  headgearItem?: Maybe<Scalars['String']>;
  clothing: Array<Ability>;
  clothingItem?: Maybe<Scalars['String']>;
  shoes: Array<Ability>;
  shoesItem?: Maybe<Scalars['String']>;
  updatedAt: Scalars['String'];
  top: Scalars['Boolean'];
  discord_user: User;
  jpn?: Maybe<Scalars['Boolean']>;
};

export type BuildCollection = {
  __typename?: 'BuildCollection';
  builds: Array<Build>;
  pageCount: Scalars['Int'];
};

export enum Ability {
  Cb = 'CB',
  Lde = 'LDE',
  Og = 'OG',
  T = 'T',
  H = 'H',
  Ns = 'NS',
  Rp = 'RP',
  Ti = 'TI',
  Dr = 'DR',
  Os = 'OS',
  Sj = 'SJ',
  Bdu = 'BDU',
  Rec = 'REC',
  Res = 'RES',
  Ism = 'ISM',
  Iss = 'ISS',
  Mpu = 'MPU',
  Qr = 'QR',
  Qsj = 'QSJ',
  Rsu = 'RSU',
  Ssu = 'SSU',
  Scu = 'SCU',
  Spu = 'SPU',
  Ss = 'SS',
  Bru = 'BRU',
  Ad = 'AD'
}

export type MapVoteInput = {
  name: Scalars['String'];
  sz: Scalars['Int'];
  tc: Scalars['Int'];
  rm: Scalars['Int'];
  cb: Scalars['Int'];
};

export type MapVoteCount = {
  __typename?: 'MapVoteCount';
  name: Scalars['String'];
  sz: Array<Scalars['Int']>;
  tc: Array<Scalars['Int']>;
  rm: Array<Scalars['Int']>;
  cb: Array<Scalars['Int']>;
};

export type PlusMaplistInfo = {
  __typename?: 'PlusMaplistInfo';
  month: Scalars['Int'];
  year: Scalars['Int'];
  voter_count: Scalars['Int'];
  vote_counts: Array<MapVoteCount>;
};

export type Maplist = {
  __typename?: 'Maplist';
  name: Scalars['String'];
  sz: Array<Scalars['String']>;
  tc: Array<Scalars['String']>;
  rm: Array<Scalars['String']>;
  cb: Array<Scalars['String']>;
  plus?: Maybe<PlusMaplistInfo>;
};

export type MapVote = {
  __typename?: 'MapVote';
  name: Scalars['String'];
  sz: Scalars['Int'];
  tc: Scalars['Int'];
  rm: Scalars['Int'];
  cb: Scalars['Int'];
};

export type GetXRankPlacementsInput = {
  name?: Maybe<Scalars['String']>;
  mode?: Maybe<RankedMode>;
  month?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export enum XRankLeaderboardType {
  FourModePeakAverage = 'FOUR_MODE_PEAK_AVERAGE',
  UniqueWeaponsCount = 'UNIQUE_WEAPONS_COUNT',
  PlacementsCount = 'PLACEMENTS_COUNT'
}

export enum RankedMode {
  Sz = 'SZ',
  Tc = 'TC',
  Rm = 'RM',
  Cb = 'CB'
}

export type XRankPlacement = {
  __typename?: 'XRankPlacement';
  id: Scalars['ID'];
  /** Player's ID. Comes from their Nintendo Switch account. */
  playerId: Scalars['String'];
  /** Player's name at the time of the placement. */
  playerName: Scalars['String'];
  /** Player's ranking in the mode that month (1-500) */
  ranking: Scalars['Int'];
  xPower: Scalars['Float'];
  weapon: Scalars['String'];
  mode: RankedMode;
  month: Scalars['Int'];
  year: Scalars['Int'];
  user?: Maybe<NewUser>;
};

export type PaginatedXRankPlacements = {
  __typename?: 'PaginatedXRankPlacements';
  records: Array<XRankPlacement>;
  recordsCount: Scalars['Int'];
  pageCount: Scalars['Int'];
};

export type XRankLeaderboardEntry = {
  __typename?: 'XRankLeaderboardEntry';
  score: Scalars['Float'];
  playerName: Scalars['String'];
  playerId: Scalars['String'];
  user?: Maybe<NewUser>;
};

export type PaginatedXRankLeaderboard = {
  __typename?: 'PaginatedXRankLeaderboard';
  records: Array<XRankLeaderboardEntry>;
  recordsCount: Scalars['Int'];
  pageCount: Scalars['Int'];
};

export type Placement = {
  __typename?: 'Placement';
  name?: Maybe<Scalars['String']>;
};

export type Player = {
  __typename?: 'Player';
  id: Scalars['ID'];
  name: Scalars['String'];
  unique_id: Scalars['String'];
  alias?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  discord_id?: Maybe<Scalars['String']>;
  weapons: Array<Scalars['String']>;
  topTotal: Array<Placement>;
  topTotalScore?: Maybe<Scalars['Float']>;
  topShooter?: Maybe<Array<Maybe<Placement>>>;
  topShooterScore?: Maybe<Scalars['Float']>;
  topBlaster?: Maybe<Array<Maybe<Placement>>>;
  topBlasterScore?: Maybe<Scalars['Float']>;
  topRoller?: Maybe<Array<Maybe<Placement>>>;
  topRollerScore?: Maybe<Scalars['Float']>;
  topCharger?: Maybe<Array<Maybe<Placement>>>;
  topChargerScore?: Maybe<Scalars['Float']>;
  topSlosher?: Maybe<Array<Maybe<Placement>>>;
  topSlosherScore?: Maybe<Scalars['Float']>;
  topSplatling?: Maybe<Array<Maybe<Placement>>>;
  topSplatlingScore?: Maybe<Scalars['Float']>;
  topDualies?: Maybe<Array<Maybe<Placement>>>;
  topDualiesScore?: Maybe<Scalars['Float']>;
  topBrella?: Maybe<Array<Maybe<Placement>>>;
  topBrellaScore?: Maybe<Scalars['Float']>;
  weaponsCount?: Maybe<Scalars['Int']>;
};

export type DiscordIdAvatar = {
  discordId: Scalars['String'];
  avatar: Scalars['String'];
};

/** The control sensitivity used in Splatoon 2 */
export type Sens = {
  __typename?: 'Sens';
  stick?: Maybe<Scalars['Float']>;
  motion?: Maybe<Scalars['Float']>;
};

/** Represents user account. */
export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  /** User's username. This is the same as their name on Discord. Updated on every log-in. */
  username: Scalars['String'];
  /** Discord discriminator. For example with Sendou#0043 0043 is the discriminator. */
  discriminator: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  discord_id: Scalars['String'];
  twitch_name?: Maybe<Scalars['String']>;
  twitter_name?: Maybe<Scalars['String']>;
  youtube_name?: Maybe<Scalars['String']>;
  youtube_id?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  sens?: Maybe<Sens>;
  bio?: Maybe<Scalars['String']>;
  weapons?: Maybe<Array<Scalars['String']>>;
  custom_url?: Maybe<Scalars['String']>;
  top500: Scalars['Boolean'];
  plus?: Maybe<PlusStatus>;
  team?: Maybe<Scalars['ID']>;
};

export type NewUser = {
  __typename?: 'NewUser';
  id: Scalars['ID'];
  fullUsername: Scalars['String'];
  discordId: Scalars['String'];
  avatarUrl: Scalars['String'];
  /** Location of user's profile */
  profilePath: Scalars['String'];
  xRankPlacements?: Maybe<Array<XRankPlacement>>;
};

export enum LinkType {
  Discord = 'DISCORD',
  Guide = 'GUIDE',
  Misc = 'MISC'
}

export type Link = {
  __typename?: 'Link';
  title: Scalars['String'];
  url: Scalars['String'];
  description: Scalars['String'];
  type: LinkType;
};

export type Year = {
  __typename?: 'Year';
  year: Scalars['Int'];
  /** Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January. */
  SZ: Array<Maybe<Scalars['Int']>>;
  /** Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January. */
  TC: Array<Maybe<Scalars['Int']>>;
  /** Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January. */
  RM: Array<Maybe<Scalars['Int']>>;
  /** Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January. */
  CB: Array<Maybe<Scalars['Int']>>;
};

export type Trend = {
  __typename?: 'Trend';
  weapon: Scalars['String'];
  counts: Array<Year>;
};

export type Tournament = {
  __typename?: 'Tournament';
  id: Scalars['ID'];
  name: Scalars['String'];
  bracket?: Maybe<Scalars['String']>;
  /** True if the tournament was a Japanese one */
  jpn: Scalars['Boolean'];
  /** Link to the Google Sheet containing ganbawoomy's data */
  google_sheet_url?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  /** Top 5 of the most played weapons in the rounds recorded */
  popular_weapons: Array<Scalars['String']>;
  winning_team_name: Scalars['String'];
  winning_team_players: Array<Scalars['String']>;
  winning_team_unique_ids?: Maybe<Array<Maybe<Scalars['String']>>>;
  rounds: Array<Round>;
};

export type TournamentCollection = {
  __typename?: 'TournamentCollection';
  tournaments: Array<Maybe<Tournament>>;
  pageCount: Scalars['Int'];
};

export type Round = {
  __typename?: 'Round';
  tournament_id: Tournament;
  stage: Scalars['String'];
  /** SZ/TC/RM/CB/TW */
  mode: Mode;
  /** E.g. Quarter-Finals */
  round_name: Scalars['String'];
  /** Order of the round. Smaller number means the round took place before. */
  round_number: Scalars['Int'];
  /** Order the match in the round. Smaller number means the match took place before. */
  game_number: Scalars['Int'];
  winning_team_name: Scalars['String'];
  winning_team_players: Array<Scalars['String']>;
  winning_team_unique_ids: Array<Maybe<Scalars['String']>>;
  winning_team_weapons: Array<Scalars['String']>;
  winning_team_main_abilities: Array<Array<Maybe<Ability>>>;
  winning_team_sub_abilities: Array<Array<Maybe<Ability>>>;
  losing_team_name: Scalars['String'];
  losing_team_players: Array<Scalars['String']>;
  losing_team_unique_ids: Array<Maybe<Scalars['String']>>;
  losing_team_weapons: Array<Scalars['String']>;
  losing_team_main_abilities: Array<Array<Maybe<Ability>>>;
  losing_team_sub_abilities: Array<Array<Maybe<Ability>>>;
};

export enum Mode {
  Sz = 'SZ',
  Tc = 'TC',
  Rm = 'RM',
  Cb = 'CB',
  Tw = 'TW'
}

export enum Region {
  All = 'all',
  Western = 'western',
  Jpn = 'jpn'
}

export type DraftCupCollection = {
  __typename?: 'DraftCupCollection';
  leaderboards: Array<Leaderboard>;
  tournaments: Array<DetailedTournament>;
};

export type DraftCupDetailCollection = {
  __typename?: 'DraftCupDetailCollection';
  tournament: DetailedTournament;
  matches: Array<DetailedMatch>;
};

export type DetailedTournamentInput = {
  name: Scalars['String'];
  bracket_url: Scalars['String'];
  date: Scalars['String'];
  top_3_team_names: Array<Scalars['String']>;
  top_3_discord_ids: Array<Array<Scalars['String']>>;
  participant_discord_ids: Array<Scalars['String']>;
};

export type DetailedTournament = {
  __typename?: 'DetailedTournament';
  name: Scalars['String'];
  bracket_url: Scalars['String'];
  date: Scalars['String'];
  top_3_team_names: Array<Scalars['String']>;
  top_3_discord_users: Array<Array<User>>;
  participant_discord_ids: Array<Scalars['String']>;
  type: EventType;
};

export type DetailedMatchInput = {
  round_name: Scalars['String'];
  round_number: Scalars['Int'];
  map_details: Array<DetailedMapInput>;
};

export type DetailedMatch = {
  __typename?: 'DetailedMatch';
  tournament_id: DetailedTournament;
  round_name: Scalars['String'];
  round_number: Scalars['Int'];
  map_details: Array<DetailedMap>;
  type: EventType;
};

export type DetailedMapInput = {
  date?: Maybe<Scalars['String']>;
  hash?: Maybe<Scalars['String']>;
  stage: Scalars['String'];
  mode: Mode;
  duration: Scalars['Int'];
  winners: TeamInfoInput;
  losers: TeamInfoInput;
};

export type DetailedMap = {
  __typename?: 'DetailedMap';
  date?: Maybe<Scalars['String']>;
  stage: Scalars['String'];
  mode: Mode;
  /** Duration of the round in seconds */
  duration: Scalars['Int'];
  winners: TeamInfo;
  losers: TeamInfo;
  type: EventType;
};

export type TeamInfoInput = {
  team_name?: Maybe<Scalars['String']>;
  players: Array<DetailedPlayerInput>;
  score: Scalars['Int'];
};

export type TeamInfo = {
  __typename?: 'TeamInfo';
  team_name?: Maybe<Scalars['String']>;
  players: Array<DetailedPlayer>;
  /** Score between 0 and 100 (KO) */
  score: Scalars['Int'];
};

export type DetailedPlayerInput = {
  discord_id?: Maybe<Scalars['String']>;
  unique_id?: Maybe<Scalars['String']>;
  weapon: Scalars['String'];
  main_abilities: Array<Ability>;
  sub_abilities: Array<Array<Maybe<Ability>>>;
  kills: Scalars['Int'];
  assists: Scalars['Int'];
  deaths: Scalars['Int'];
  specials: Scalars['Int'];
  paint: Scalars['Int'];
  gear?: Maybe<Array<Scalars['String']>>;
};

export type DetailedPlayer = {
  __typename?: 'DetailedPlayer';
  discord_user?: Maybe<User>;
  unique_id?: Maybe<Scalars['String']>;
  weapon: Scalars['String'];
  main_abilities: Array<Ability>;
  sub_abilities: Array<Array<Maybe<Ability>>>;
  kills: Scalars['Int'];
  assists: Scalars['Int'];
  deaths: Scalars['Int'];
  specials: Scalars['Int'];
  paint: Scalars['Int'];
  gear?: Maybe<Array<Scalars['String']>>;
};

export type Leaderboard = {
  __typename?: 'Leaderboard';
  players: Array<TournamentPlayer>;
  type: EventType;
};

export type TournamentPlayer = {
  __typename?: 'TournamentPlayer';
  discord_user: User;
  /** Number of first places */
  first: Scalars['Int'];
  /** Number of second places */
  second: Scalars['Int'];
  /** Number of third places */
  third: Scalars['Int'];
  score: Scalars['Int'];
};

export type TournamentPlayerInput = {
  discord_id: Scalars['String'];
  first: Scalars['Int'];
  second: Scalars['Int'];
  third: Scalars['Int'];
};

export type PlayerStat = {
  __typename?: 'PlayerStat';
  discord_id: Scalars['String'];
  /** Weapon of the stat. ALL if stat is all weapon stats summed up */
  weapon: Scalars['String'];
  kills: Scalars['Int'];
  assists: Scalars['Int'];
  deaths: Scalars['Int'];
  specials: Scalars['Int'];
  paint: Scalars['Int'];
  seconds_played: Scalars['Int'];
  games_played: Scalars['Int'];
  wins: Scalars['Int'];
  type: EventType;
};

export enum EventType {
  Draftone = 'DRAFTONE',
  Drafttwo = 'DRAFTTWO',
  Analyzer = 'ANALYZER'
}

export type CompetitiveFeedEvent = {
  __typename?: 'CompetitiveFeedEvent';
  name: Scalars['String'];
  date: Scalars['String'];
  description: Scalars['String'];
  poster_discord_id: Scalars['String'];
  poster_discord_user: User;
  message_discord_id: Scalars['String'];
  message_url: Scalars['String'];
  discord_invite_url: Scalars['String'];
  picture_url?: Maybe<Scalars['String']>;
};

export type CompetitiveFeedEventInput = {
  name: Scalars['String'];
  date: Scalars['String'];
  description: Scalars['String'];
  poster_discord_id: Scalars['String'];
  poster_username: Scalars['String'];
  poster_discriminator: Scalars['String'];
  message_discord_id: Scalars['String'];
  message_url: Scalars['String'];
  discord_invite_url: Scalars['String'];
  picture_url?: Maybe<Scalars['String']>;
};

export type UpdateCompetitiveFeedEventInput = {
  name: Scalars['String'];
  date: Scalars['String'];
  description: Scalars['String'];
  message_discord_id: Scalars['String'];
  discord_invite_url: Scalars['String'];
  picture_url?: Maybe<Scalars['String']>;
};

export enum CanVc {
  Yes = 'YES',
  Usually = 'USUALLY',
  Sometimes = 'SOMETIMES',
  No = 'NO'
}

export enum Playstyle {
  Frontline = 'FRONTLINE',
  Midline = 'MIDLINE',
  Backline = 'BACKLINE'
}

export type FaMatches = {
  __typename?: 'FAMatches';
  matched_discord_users: Array<User>;
  number_of_likes_received: Scalars['Int'];
  liked_discord_ids: Array<Scalars['String']>;
};

/** Represents a free agent post of a player looking for a team */
export type FaPost = {
  __typename?: 'FAPost';
  id: Scalars['ID'];
  discord_id: Scalars['String'];
  can_vc: CanVc;
  playstyles?: Maybe<Array<Playstyle>>;
  /** How active is the free agent */
  activity?: Maybe<Scalars['String']>;
  /** What kind of team they are looking for */
  looking_for?: Maybe<Scalars['String']>;
  /** Teams or other past experience in competitive */
  past_experience?: Maybe<Scalars['String']>;
  /** Free word about anything else */
  description?: Maybe<Scalars['String']>;
  discord_user: User;
  hidden: Scalars['Boolean'];
  createdAt: Scalars['String'];
};

/** +1 or +2 LFG server on Discord */
export enum PlusServer {
  One = 'ONE',
  Two = 'TWO'
}

/** Region used for voting */
export enum PlusRegion {
  Eu = 'EU',
  Na = 'NA'
}

export type PlusGeneralInfo = {
  __typename?: 'PlusGeneralInfo';
  voting_ends?: Maybe<Scalars['String']>;
  voter_count: Scalars['Int'];
  eligible_voters: Scalars['Int'];
};

export type Suggested = {
  __typename?: 'Suggested';
  discord_id: Scalars['String'];
  discord_user: User;
  suggester_discord_id: Scalars['String'];
  suggester_discord_user: User;
  plus_region: PlusRegion;
  plus_server: PlusServer;
  description: Scalars['String'];
  createdAt: Scalars['String'];
};

/** Status with +1 and +2 related things */
export type PlusStatus = {
  __typename?: 'PlusStatus';
  membership_status?: Maybe<PlusServer>;
  vouch_status?: Maybe<PlusServer>;
  plus_region?: Maybe<PlusRegion>;
  can_vouch?: Maybe<PlusServer>;
  voucher_discord_id?: Maybe<Scalars['String']>;
  voucher_user?: Maybe<User>;
  can_vouch_again_after?: Maybe<Scalars['String']>;
};

export type VoteInput = {
  discord_id: Scalars['String'];
  score: Scalars['Int'];
};

export type VotedPerson = {
  __typename?: 'VotedPerson';
  discord_id: Scalars['String'];
  voter_discord_id: Scalars['String'];
  plus_server: Scalars['String'];
  month: Scalars['Int'];
  year: Scalars['Int'];
  /** Voting result -2 to +2 (-1 to +1 cross-region) */
  score: Scalars['Int'];
  stale: Scalars['Boolean'];
};

export type Score = {
  __typename?: 'Score';
  total: Scalars['Float'];
  eu_count?: Maybe<Array<Maybe<Scalars['Int']>>>;
  na_count?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

/** Voting result of a player */
export type Summary = {
  __typename?: 'Summary';
  discord_id: Scalars['String'];
  discord_user: User;
  plus_server: PlusServer;
  month: Scalars['Int'];
  year: Scalars['Int'];
  suggested?: Maybe<Scalars['Boolean']>;
  vouched?: Maybe<Scalars['Boolean']>;
  /** Average of all scores of the voters for the month 0% to 100% */
  score: Score;
  new: Scalars['Boolean'];
};

export type UsersForVoting = {
  __typename?: 'UsersForVoting';
  users: Array<User>;
  suggested: Array<Suggested>;
  votes: Array<VotedPerson>;
};

export type Founded = {
  __typename?: 'Founded';
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export type Member = {
  __typename?: 'Member';
  discordId: Scalars['String'];
  captain?: Maybe<Scalars['Boolean']>;
  role?: Maybe<Scalars['String']>;
};

export type TeamMemberPlacement = {
  __typename?: 'TeamMemberPlacement';
  discordId: Scalars['String'];
  mode: Scalars['Int'];
  weapon: Scalars['String'];
  month: Scalars['Int'];
  year: Scalars['Int'];
  xPower: Scalars['Float'];
};

export type Team = {
  __typename?: 'Team';
  name: Scalars['String'];
  disbanded?: Maybe<Scalars['Boolean']>;
  founded?: Maybe<Founded>;
  members?: Maybe<Array<Member>>;
  countries?: Maybe<Array<Scalars['String']>>;
  pastMembersDiscordIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  tag?: Maybe<Scalars['String']>;
  lfPost?: Maybe<Scalars['String']>;
  xpPlacements?: Maybe<Array<TeamMemberPlacement>>;
  teamXp?: Maybe<Scalars['Float']>;
};

export type Stats = {
  __typename?: 'Stats';
  build_count: Scalars['Int'];
  fa_count: Scalars['Int'];
  user_count: Scalars['Int'];
  tournament_count: Scalars['Int'];
};

export type Banner = {
  __typename?: 'Banner';
  id: Scalars['ID'];
  logoUrl: Scalars['String'];
  description: Scalars['String'];
  link: Scalars['String'];
  textColor: Scalars['String'];
  bgColor: Scalars['String'];
  staleAfter: Scalars['String'];
};

export type UserLeanFragment = (
  { __typename?: 'NewUser' }
  & Pick<NewUser, 'profilePath' | 'fullUsername' | 'avatarUrl'>
);

export type GetPeakXPowerLeaderboardQueryVariables = Exact<{
  page?: Maybe<Scalars['Int']>;
  weapon?: Maybe<Scalars['String']>;
}>;


export type GetPeakXPowerLeaderboardQuery = (
  { __typename?: 'Query' }
  & { getPeakXPowerLeaderboard: (
    { __typename?: 'PaginatedXRankPlacements' }
    & Pick<PaginatedXRankPlacements, 'recordsCount' | 'pageCount'>
    & { records: Array<(
      { __typename?: 'XRankPlacement' }
      & Pick<XRankPlacement, 'id' | 'playerName' | 'xPower' | 'weapon' | 'mode' | 'month' | 'year'>
      & { user?: Maybe<(
        { __typename?: 'NewUser' }
        & UserLeanFragment
      )> }
    )> }
  ) }
);

export type GetUsersXRankPlacementsQueryVariables = Exact<{
  identifier: Scalars['String'];
}>;


export type GetUsersXRankPlacementsQuery = (
  { __typename?: 'Query' }
  & { getUserByIdentifier?: Maybe<(
    { __typename?: 'NewUser' }
    & { xRankPlacements?: Maybe<Array<(
      { __typename?: 'XRankPlacement' }
      & Pick<XRankPlacement, 'id' | 'weapon' | 'ranking' | 'mode' | 'xPower' | 'month' | 'year'>
    )>> }
  )> }
);

export type GetXRankLeaderboardQueryVariables = Exact<{
  page?: Maybe<Scalars['Int']>;
  type: XRankLeaderboardType;
}>;


export type GetXRankLeaderboardQuery = (
  { __typename?: 'Query' }
  & { getXRankLeaderboard: (
    { __typename?: 'PaginatedXRankLeaderboard' }
    & Pick<PaginatedXRankLeaderboard, 'pageCount' | 'recordsCount'>
    & { records: Array<(
      { __typename?: 'XRankLeaderboardEntry' }
      & Pick<XRankLeaderboardEntry, 'playerName' | 'playerId' | 'score'>
      & { user?: Maybe<(
        { __typename?: 'NewUser' }
        & UserLeanFragment
      )> }
    )> }
  ) }
);

export type GetXRankPlacementsQueryVariables = Exact<{
  page?: Maybe<Scalars['Int']>;
  filter?: Maybe<GetXRankPlacementsInput>;
}>;


export type GetXRankPlacementsQuery = (
  { __typename?: 'Query' }
  & { getXRankPlacements: (
    { __typename?: 'PaginatedXRankPlacements' }
    & Pick<PaginatedXRankPlacements, 'pageCount' | 'recordsCount'>
    & { records: Array<(
      { __typename?: 'XRankPlacement' }
      & Pick<XRankPlacement, 'id' | 'playerName' | 'xPower' | 'weapon' | 'ranking' | 'mode' | 'month' | 'year'>
      & { user?: Maybe<(
        { __typename?: 'NewUser' }
        & UserLeanFragment
      )> }
    )> }
  ) }
);

export const UserLeanFragmentDoc = gql`
    fragment UserLean on NewUser {
  profilePath
  fullUsername
  avatarUrl
}
    `;
export const GetPeakXPowerLeaderboardDocument = gql`
    query getPeakXPowerLeaderboard($page: Int, $weapon: String) {
  getPeakXPowerLeaderboard(page: $page, weapon: $weapon) {
    records {
      id
      playerName
      xPower
      weapon
      mode
      month
      year
      user {
        ...UserLean
      }
    }
    recordsCount
    pageCount
  }
}
    ${UserLeanFragmentDoc}`;

/**
 * __useGetPeakXPowerLeaderboardQuery__
 *
 * To run a query within a React component, call `useGetPeakXPowerLeaderboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPeakXPowerLeaderboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPeakXPowerLeaderboardQuery({
 *   variables: {
 *      page: // value for 'page'
 *      weapon: // value for 'weapon'
 *   },
 * });
 */
export function useGetPeakXPowerLeaderboardQuery(baseOptions?: Apollo.QueryHookOptions<GetPeakXPowerLeaderboardQuery, GetPeakXPowerLeaderboardQueryVariables>) {
        return Apollo.useQuery<GetPeakXPowerLeaderboardQuery, GetPeakXPowerLeaderboardQueryVariables>(GetPeakXPowerLeaderboardDocument, baseOptions);
      }
export function useGetPeakXPowerLeaderboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPeakXPowerLeaderboardQuery, GetPeakXPowerLeaderboardQueryVariables>) {
          return Apollo.useLazyQuery<GetPeakXPowerLeaderboardQuery, GetPeakXPowerLeaderboardQueryVariables>(GetPeakXPowerLeaderboardDocument, baseOptions);
        }
export type GetPeakXPowerLeaderboardQueryHookResult = ReturnType<typeof useGetPeakXPowerLeaderboardQuery>;
export type GetPeakXPowerLeaderboardLazyQueryHookResult = ReturnType<typeof useGetPeakXPowerLeaderboardLazyQuery>;
export type GetPeakXPowerLeaderboardQueryResult = Apollo.QueryResult<GetPeakXPowerLeaderboardQuery, GetPeakXPowerLeaderboardQueryVariables>;
export const GetUsersXRankPlacementsDocument = gql`
    query getUsersXRankPlacements($identifier: String!) {
  getUserByIdentifier(identifier: $identifier) {
    xRankPlacements {
      id
      weapon
      ranking
      mode
      xPower
      month
      year
    }
  }
}
    `;

/**
 * __useGetUsersXRankPlacementsQuery__
 *
 * To run a query within a React component, call `useGetUsersXRankPlacementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersXRankPlacementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersXRankPlacementsQuery({
 *   variables: {
 *      identifier: // value for 'identifier'
 *   },
 * });
 */
export function useGetUsersXRankPlacementsQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersXRankPlacementsQuery, GetUsersXRankPlacementsQueryVariables>) {
        return Apollo.useQuery<GetUsersXRankPlacementsQuery, GetUsersXRankPlacementsQueryVariables>(GetUsersXRankPlacementsDocument, baseOptions);
      }
export function useGetUsersXRankPlacementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersXRankPlacementsQuery, GetUsersXRankPlacementsQueryVariables>) {
          return Apollo.useLazyQuery<GetUsersXRankPlacementsQuery, GetUsersXRankPlacementsQueryVariables>(GetUsersXRankPlacementsDocument, baseOptions);
        }
export type GetUsersXRankPlacementsQueryHookResult = ReturnType<typeof useGetUsersXRankPlacementsQuery>;
export type GetUsersXRankPlacementsLazyQueryHookResult = ReturnType<typeof useGetUsersXRankPlacementsLazyQuery>;
export type GetUsersXRankPlacementsQueryResult = Apollo.QueryResult<GetUsersXRankPlacementsQuery, GetUsersXRankPlacementsQueryVariables>;
export const GetXRankLeaderboardDocument = gql`
    query getXRankLeaderboard($page: Int, $type: XRankLeaderboardType!) {
  getXRankLeaderboard(page: $page, type: $type) {
    records {
      playerName
      playerId
      score
      user {
        ...UserLean
      }
    }
    pageCount
    recordsCount
  }
}
    ${UserLeanFragmentDoc}`;

/**
 * __useGetXRankLeaderboardQuery__
 *
 * To run a query within a React component, call `useGetXRankLeaderboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetXRankLeaderboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetXRankLeaderboardQuery({
 *   variables: {
 *      page: // value for 'page'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetXRankLeaderboardQuery(baseOptions?: Apollo.QueryHookOptions<GetXRankLeaderboardQuery, GetXRankLeaderboardQueryVariables>) {
        return Apollo.useQuery<GetXRankLeaderboardQuery, GetXRankLeaderboardQueryVariables>(GetXRankLeaderboardDocument, baseOptions);
      }
export function useGetXRankLeaderboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetXRankLeaderboardQuery, GetXRankLeaderboardQueryVariables>) {
          return Apollo.useLazyQuery<GetXRankLeaderboardQuery, GetXRankLeaderboardQueryVariables>(GetXRankLeaderboardDocument, baseOptions);
        }
export type GetXRankLeaderboardQueryHookResult = ReturnType<typeof useGetXRankLeaderboardQuery>;
export type GetXRankLeaderboardLazyQueryHookResult = ReturnType<typeof useGetXRankLeaderboardLazyQuery>;
export type GetXRankLeaderboardQueryResult = Apollo.QueryResult<GetXRankLeaderboardQuery, GetXRankLeaderboardQueryVariables>;
export const GetXRankPlacementsDocument = gql`
    query getXRankPlacements($page: Int, $filter: GetXRankPlacementsInput) {
  getXRankPlacements(page: $page, filter: $filter) {
    records {
      id
      playerName
      xPower
      weapon
      ranking
      mode
      month
      year
      user {
        ...UserLean
      }
    }
    pageCount
    recordsCount
  }
}
    ${UserLeanFragmentDoc}`;

/**
 * __useGetXRankPlacementsQuery__
 *
 * To run a query within a React component, call `useGetXRankPlacementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetXRankPlacementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetXRankPlacementsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetXRankPlacementsQuery(baseOptions?: Apollo.QueryHookOptions<GetXRankPlacementsQuery, GetXRankPlacementsQueryVariables>) {
        return Apollo.useQuery<GetXRankPlacementsQuery, GetXRankPlacementsQueryVariables>(GetXRankPlacementsDocument, baseOptions);
      }
export function useGetXRankPlacementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetXRankPlacementsQuery, GetXRankPlacementsQueryVariables>) {
          return Apollo.useLazyQuery<GetXRankPlacementsQuery, GetXRankPlacementsQueryVariables>(GetXRankPlacementsDocument, baseOptions);
        }
export type GetXRankPlacementsQueryHookResult = ReturnType<typeof useGetXRankPlacementsQuery>;
export type GetXRankPlacementsLazyQueryHookResult = ReturnType<typeof useGetXRankPlacementsLazyQuery>;
export type GetXRankPlacementsQueryResult = Apollo.QueryResult<GetXRankPlacementsQuery, GetXRankPlacementsQueryVariables>;