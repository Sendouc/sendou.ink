import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: any;
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: Date;
  /** A universally unique identifier as defined by [RFC 4122](https://tools.ietf.org/html/rfc4122). */
  UUID: any;
};

export type Account = Node & {
  __typename?: 'Account';
  createdAt?: Maybe<Scalars['Datetime']>;
  discordAvatar?: Maybe<Scalars['String']>;
  discordDiscriminator: Scalars['String'];
  discordFullUsername?: Maybe<Scalars['String']>;
  discordId: Scalars['String'];
  discordUsername: Scalars['String'];
  id: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads and enables pagination through a set of `Organization`. */
  organizationsByOwnerId: OrganizationsConnection;
  /** Reads and enables pagination through a set of `TournamentTeamRoster`. */
  tournamentTeamRostersByMemberId: TournamentTeamRostersConnection;
  twitch?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
  youtubeId?: Maybe<Scalars['String']>;
  youtubeName?: Maybe<Scalars['String']>;
};


export type AccountOrganizationsByOwnerIdArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<OrganizationCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrganizationsOrderBy>>;
};


export type AccountTournamentTeamRostersByMemberIdArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentTeamRosterCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentTeamRostersOrderBy>>;
};

/** A condition to be used against `Account` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type AccountCondition = {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: Maybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `discordAvatar` field. */
  discordAvatar?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `discordDiscriminator` field. */
  discordDiscriminator?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `discordId` field. */
  discordId?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `discordUsername` field. */
  discordUsername?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `id` field. */
  id?: Maybe<Scalars['Int']>;
  /** Checks for equality with the object’s `twitch` field. */
  twitch?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `twitter` field. */
  twitter?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `updatedAt` field. */
  updatedAt?: Maybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `youtubeId` field. */
  youtubeId?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `youtubeName` field. */
  youtubeName?: Maybe<Scalars['String']>;
};

/** An input for mutations affecting `Account` */
export type AccountInput = {
  createdAt?: Maybe<Scalars['Datetime']>;
  discordAvatar?: Maybe<Scalars['String']>;
  discordDiscriminator: Scalars['String'];
  discordId: Scalars['String'];
  discordUsername: Scalars['String'];
  id?: Maybe<Scalars['Int']>;
  twitch?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
  youtubeId?: Maybe<Scalars['String']>;
  youtubeName?: Maybe<Scalars['String']>;
};

/** Represents an update to a `Account`. Fields that are set will be updated. */
export type AccountPatch = {
  createdAt?: Maybe<Scalars['Datetime']>;
  discordAvatar?: Maybe<Scalars['String']>;
  discordDiscriminator?: Maybe<Scalars['String']>;
  discordId?: Maybe<Scalars['String']>;
  discordUsername?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  twitch?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
  youtubeId?: Maybe<Scalars['String']>;
  youtubeName?: Maybe<Scalars['String']>;
};

/** A connection to a list of `Account` values. */
export type AccountsConnection = {
  __typename?: 'AccountsConnection';
  /** A list of edges which contains the `Account` and cursor to aid in pagination. */
  edges: Array<AccountsEdge>;
  /** A list of `Account` objects. */
  nodes: Array<Account>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Account` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Account` edge in the connection. */
export type AccountsEdge = {
  __typename?: 'AccountsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Account` at the end of the edge. */
  node: Account;
};

/** Methods to use when ordering `Account`. */
export enum AccountsOrderBy {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DiscordAvatarAsc = 'DISCORD_AVATAR_ASC',
  DiscordAvatarDesc = 'DISCORD_AVATAR_DESC',
  DiscordDiscriminatorAsc = 'DISCORD_DISCRIMINATOR_ASC',
  DiscordDiscriminatorDesc = 'DISCORD_DISCRIMINATOR_DESC',
  DiscordIdAsc = 'DISCORD_ID_ASC',
  DiscordIdDesc = 'DISCORD_ID_DESC',
  DiscordUsernameAsc = 'DISCORD_USERNAME_ASC',
  DiscordUsernameDesc = 'DISCORD_USERNAME_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TwitchAsc = 'TWITCH_ASC',
  TwitchDesc = 'TWITCH_DESC',
  TwitterAsc = 'TWITTER_ASC',
  TwitterDesc = 'TWITTER_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  YoutubeIdAsc = 'YOUTUBE_ID_ASC',
  YoutubeIdDesc = 'YOUTUBE_ID_DESC',
  YoutubeNameAsc = 'YOUTUBE_NAME_ASC',
  YoutubeNameDesc = 'YOUTUBE_NAME_DESC'
}

/** All input for the create `Account` mutation. */
export type CreateAccountInput = {
  /** The `Account` to be created by this mutation. */
  account: AccountInput;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
};

/** The output of our create `Account` mutation. */
export type CreateAccountPayload = {
  __typename?: 'CreateAccountPayload';
  /** The `Account` that was created by this mutation. */
  account?: Maybe<Account>;
  /** An edge for our `Account`. May be used by Relay 1. */
  accountEdge?: Maybe<AccountsEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `Account` mutation. */
export type CreateAccountPayloadAccountEdgeArgs = {
  orderBy?: Maybe<Array<AccountsOrderBy>>;
};

/** All input for the create `MapMode` mutation. */
export type CreateMapModeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `MapMode` to be created by this mutation. */
  mapMode: MapModeInput;
};

/** The output of our create `MapMode` mutation. */
export type CreateMapModePayload = {
  __typename?: 'CreateMapModePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `MapMode` that was created by this mutation. */
  mapMode?: Maybe<MapMode>;
  /** An edge for our `MapMode`. May be used by Relay 1. */
  mapModeEdge?: Maybe<MapModesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `MapMode` mutation. */
export type CreateMapModePayloadMapModeEdgeArgs = {
  orderBy?: Maybe<Array<MapModesOrderBy>>;
};

/** All input for the create `MapPool` mutation. */
export type CreateMapPoolInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `MapPool` to be created by this mutation. */
  mapPool: MapPoolInput;
};

/** The output of our create `MapPool` mutation. */
export type CreateMapPoolPayload = {
  __typename?: 'CreateMapPoolPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reads a single `MapMode` that is related to this `MapPool`. */
  mapModeByMapModeId: MapMode;
  /** The `MapPool` that was created by this mutation. */
  mapPool?: Maybe<MapPool>;
  /** An edge for our `MapPool`. May be used by Relay 1. */
  mapPoolEdge?: Maybe<MapPoolsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Tournament` that is related to this `MapPool`. */
  tournamentByTournamentIdentifier: Tournament;
};


/** The output of our create `MapPool` mutation. */
export type CreateMapPoolPayloadMapPoolEdgeArgs = {
  orderBy?: Maybe<Array<MapPoolsOrderBy>>;
};

/** All input for the create `Organization` mutation. */
export type CreateOrganizationInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Organization` to be created by this mutation. */
  organization: OrganizationInput;
};

/** The output of our create `Organization` mutation. */
export type CreateOrganizationPayload = {
  __typename?: 'CreateOrganizationPayload';
  /** Reads a single `Account` that is related to this `Organization`. */
  accountByOwnerId: Account;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Organization` that was created by this mutation. */
  organization?: Maybe<Organization>;
  /** An edge for our `Organization`. May be used by Relay 1. */
  organizationEdge?: Maybe<OrganizationsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our create `Organization` mutation. */
export type CreateOrganizationPayloadOrganizationEdgeArgs = {
  orderBy?: Maybe<Array<OrganizationsOrderBy>>;
};

/** All input for the create `Tournament` mutation. */
export type CreateTournamentInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Tournament` to be created by this mutation. */
  tournament: TournamentInput;
};

/** The output of our create `Tournament` mutation. */
export type CreateTournamentPayload = {
  __typename?: 'CreateTournamentPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reads a single `Organization` that is related to this `Tournament`. */
  organizationByOrganizationIdentifier: Organization;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Tournament` that was created by this mutation. */
  tournament?: Maybe<Tournament>;
  /** An edge for our `Tournament`. May be used by Relay 1. */
  tournamentEdge?: Maybe<TournamentsEdge>;
};


/** The output of our create `Tournament` mutation. */
export type CreateTournamentPayloadTournamentEdgeArgs = {
  orderBy?: Maybe<Array<TournamentsOrderBy>>;
};

/** All input for the create `TournamentTeam` mutation. */
export type CreateTournamentTeamInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `TournamentTeam` to be created by this mutation. */
  tournamentTeam: TournamentTeamInput;
};

/** The output of our create `TournamentTeam` mutation. */
export type CreateTournamentTeamPayload = {
  __typename?: 'CreateTournamentTeamPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Tournament` that is related to this `TournamentTeam`. */
  tournamentByTournamentIdentifier: Tournament;
  /** The `TournamentTeam` that was created by this mutation. */
  tournamentTeam?: Maybe<TournamentTeam>;
  /** An edge for our `TournamentTeam`. May be used by Relay 1. */
  tournamentTeamEdge?: Maybe<TournamentTeamsEdge>;
};


/** The output of our create `TournamentTeam` mutation. */
export type CreateTournamentTeamPayloadTournamentTeamEdgeArgs = {
  orderBy?: Maybe<Array<TournamentTeamsOrderBy>>;
};

/** All input for the create `TournamentTeamRoster` mutation. */
export type CreateTournamentTeamRosterInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `TournamentTeamRoster` to be created by this mutation. */
  tournamentTeamRoster: TournamentTeamRosterInput;
};

/** The output of our create `TournamentTeamRoster` mutation. */
export type CreateTournamentTeamRosterPayload = {
  __typename?: 'CreateTournamentTeamRosterPayload';
  /** Reads a single `Account` that is related to this `TournamentTeamRoster`. */
  accountByMemberId: Account;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `TournamentTeam` that is related to this `TournamentTeamRoster`. */
  tournamentTeamByTournamentTeamId: TournamentTeam;
  /** The `TournamentTeamRoster` that was created by this mutation. */
  tournamentTeamRoster?: Maybe<TournamentTeamRoster>;
  /** An edge for our `TournamentTeamRoster`. May be used by Relay 1. */
  tournamentTeamRosterEdge?: Maybe<TournamentTeamRostersEdge>;
};


/** The output of our create `TournamentTeamRoster` mutation. */
export type CreateTournamentTeamRosterPayloadTournamentTeamRosterEdgeArgs = {
  orderBy?: Maybe<Array<TournamentTeamRostersOrderBy>>;
};

/** All input for the `deleteAccountById` mutation. */
export type DeleteAccountByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteAccount` mutation. */
export type DeleteAccountInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Account` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Account` mutation. */
export type DeleteAccountPayload = {
  __typename?: 'DeleteAccountPayload';
  /** The `Account` that was deleted by this mutation. */
  account?: Maybe<Account>;
  /** An edge for our `Account`. May be used by Relay 1. */
  accountEdge?: Maybe<AccountsEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedAccountId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `Account` mutation. */
export type DeleteAccountPayloadAccountEdgeArgs = {
  orderBy?: Maybe<Array<AccountsOrderBy>>;
};

/** All input for the `deleteMapModeById` mutation. */
export type DeleteMapModeByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteMapModeByStageAndGameMode` mutation. */
export type DeleteMapModeByStageAndGameModeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  gameMode: ModeEnum;
  stage: Scalars['String'];
};

/** All input for the `deleteMapMode` mutation. */
export type DeleteMapModeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `MapMode` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `MapMode` mutation. */
export type DeleteMapModePayload = {
  __typename?: 'DeleteMapModePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedMapModeId?: Maybe<Scalars['ID']>;
  /** The `MapMode` that was deleted by this mutation. */
  mapMode?: Maybe<MapMode>;
  /** An edge for our `MapMode`. May be used by Relay 1. */
  mapModeEdge?: Maybe<MapModesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `MapMode` mutation. */
export type DeleteMapModePayloadMapModeEdgeArgs = {
  orderBy?: Maybe<Array<MapModesOrderBy>>;
};

/** All input for the `deleteMapPoolByTournamentIdentifierAndMapModeId` mutation. */
export type DeleteMapPoolByTournamentIdentifierAndMapModeIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  mapModeId: Scalars['Int'];
  tournamentIdentifier: Scalars['String'];
};

/** The output of our delete `MapPool` mutation. */
export type DeleteMapPoolPayload = {
  __typename?: 'DeleteMapPoolPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedMapPoolId?: Maybe<Scalars['ID']>;
  /** Reads a single `MapMode` that is related to this `MapPool`. */
  mapModeByMapModeId: MapMode;
  /** The `MapPool` that was deleted by this mutation. */
  mapPool?: Maybe<MapPool>;
  /** An edge for our `MapPool`. May be used by Relay 1. */
  mapPoolEdge?: Maybe<MapPoolsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Tournament` that is related to this `MapPool`. */
  tournamentByTournamentIdentifier: Tournament;
};


/** The output of our delete `MapPool` mutation. */
export type DeleteMapPoolPayloadMapPoolEdgeArgs = {
  orderBy?: Maybe<Array<MapPoolsOrderBy>>;
};

/** All input for the `deleteOrganizationByIdentifier` mutation. */
export type DeleteOrganizationByIdentifierInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  identifier: Scalars['String'];
};

/** All input for the `deleteOrganization` mutation. */
export type DeleteOrganizationInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Organization` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Organization` mutation. */
export type DeleteOrganizationPayload = {
  __typename?: 'DeleteOrganizationPayload';
  /** Reads a single `Account` that is related to this `Organization`. */
  accountByOwnerId: Account;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedOrganizationId?: Maybe<Scalars['ID']>;
  /** The `Organization` that was deleted by this mutation. */
  organization?: Maybe<Organization>;
  /** An edge for our `Organization`. May be used by Relay 1. */
  organizationEdge?: Maybe<OrganizationsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our delete `Organization` mutation. */
export type DeleteOrganizationPayloadOrganizationEdgeArgs = {
  orderBy?: Maybe<Array<OrganizationsOrderBy>>;
};

/** All input for the `deleteTournamentByIdentifier` mutation. */
export type DeleteTournamentByIdentifierInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  identifier: Scalars['String'];
};

/** All input for the `deleteTournament` mutation. */
export type DeleteTournamentInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Tournament` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `Tournament` mutation. */
export type DeleteTournamentPayload = {
  __typename?: 'DeleteTournamentPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedTournamentId?: Maybe<Scalars['ID']>;
  /** Reads a single `Organization` that is related to this `Tournament`. */
  organizationByOrganizationIdentifier: Organization;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Tournament` that was deleted by this mutation. */
  tournament?: Maybe<Tournament>;
  /** An edge for our `Tournament`. May be used by Relay 1. */
  tournamentEdge?: Maybe<TournamentsEdge>;
};


/** The output of our delete `Tournament` mutation. */
export type DeleteTournamentPayloadTournamentEdgeArgs = {
  orderBy?: Maybe<Array<TournamentsOrderBy>>;
};

/** All input for the `deleteTournamentTeamById` mutation. */
export type DeleteTournamentTeamByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `deleteTournamentTeamByInviteCode` mutation. */
export type DeleteTournamentTeamByInviteCodeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  inviteCode: Scalars['UUID'];
};

/** All input for the `deleteTournamentTeamByNameAndTournamentIdentifier` mutation. */
export type DeleteTournamentTeamByNameAndTournamentIdentifierInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  tournamentIdentifier: Scalars['String'];
};

/** All input for the `deleteTournamentTeam` mutation. */
export type DeleteTournamentTeamInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `TournamentTeam` to be deleted. */
  nodeId: Scalars['ID'];
};

/** The output of our delete `TournamentTeam` mutation. */
export type DeleteTournamentTeamPayload = {
  __typename?: 'DeleteTournamentTeamPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedTournamentTeamId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Tournament` that is related to this `TournamentTeam`. */
  tournamentByTournamentIdentifier: Tournament;
  /** The `TournamentTeam` that was deleted by this mutation. */
  tournamentTeam?: Maybe<TournamentTeam>;
  /** An edge for our `TournamentTeam`. May be used by Relay 1. */
  tournamentTeamEdge?: Maybe<TournamentTeamsEdge>;
};


/** The output of our delete `TournamentTeam` mutation. */
export type DeleteTournamentTeamPayloadTournamentTeamEdgeArgs = {
  orderBy?: Maybe<Array<TournamentTeamsOrderBy>>;
};

/** All input for the `deleteTournamentTeamRosterByMemberIdAndTournamentTeamId` mutation. */
export type DeleteTournamentTeamRosterByMemberIdAndTournamentTeamIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  memberId: Scalars['Int'];
  tournamentTeamId: Scalars['Int'];
};

/** The output of our delete `TournamentTeamRoster` mutation. */
export type DeleteTournamentTeamRosterPayload = {
  __typename?: 'DeleteTournamentTeamRosterPayload';
  /** Reads a single `Account` that is related to this `TournamentTeamRoster`. */
  accountByMemberId: Account;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  deletedTournamentTeamRosterId?: Maybe<Scalars['ID']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `TournamentTeam` that is related to this `TournamentTeamRoster`. */
  tournamentTeamByTournamentTeamId: TournamentTeam;
  /** The `TournamentTeamRoster` that was deleted by this mutation. */
  tournamentTeamRoster?: Maybe<TournamentTeamRoster>;
  /** An edge for our `TournamentTeamRoster`. May be used by Relay 1. */
  tournamentTeamRosterEdge?: Maybe<TournamentTeamRostersEdge>;
};


/** The output of our delete `TournamentTeamRoster` mutation. */
export type DeleteTournamentTeamRosterPayloadTournamentTeamRosterEdgeArgs = {
  orderBy?: Maybe<Array<TournamentTeamRostersOrderBy>>;
};

export type MapMode = Node & {
  __typename?: 'MapMode';
  gameMode: ModeEnum;
  id: Scalars['Int'];
  /** Reads and enables pagination through a set of `MapPool`. */
  mapPoolsByMapModeId: MapPoolsConnection;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  stage: Scalars['String'];
};


export type MapModeMapPoolsByMapModeIdArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<MapPoolCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<MapPoolsOrderBy>>;
};

/** A condition to be used against `MapMode` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type MapModeCondition = {
  /** Checks for equality with the object’s `gameMode` field. */
  gameMode?: Maybe<ModeEnum>;
  /** Checks for equality with the object’s `id` field. */
  id?: Maybe<Scalars['Int']>;
  /** Checks for equality with the object’s `stage` field. */
  stage?: Maybe<Scalars['String']>;
};

/** An input for mutations affecting `MapMode` */
export type MapModeInput = {
  gameMode: ModeEnum;
  id?: Maybe<Scalars['Int']>;
  stage: Scalars['String'];
};

/** Represents an update to a `MapMode`. Fields that are set will be updated. */
export type MapModePatch = {
  gameMode?: Maybe<ModeEnum>;
  id?: Maybe<Scalars['Int']>;
  stage?: Maybe<Scalars['String']>;
};

/** A connection to a list of `MapMode` values. */
export type MapModesConnection = {
  __typename?: 'MapModesConnection';
  /** A list of edges which contains the `MapMode` and cursor to aid in pagination. */
  edges: Array<MapModesEdge>;
  /** A list of `MapMode` objects. */
  nodes: Array<MapMode>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `MapMode` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `MapMode` edge in the connection. */
export type MapModesEdge = {
  __typename?: 'MapModesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `MapMode` at the end of the edge. */
  node: MapMode;
};

/** Methods to use when ordering `MapMode`. */
export enum MapModesOrderBy {
  GameModeAsc = 'GAME_MODE_ASC',
  GameModeDesc = 'GAME_MODE_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StageAsc = 'STAGE_ASC',
  StageDesc = 'STAGE_DESC'
}

export type MapPool = {
  __typename?: 'MapPool';
  /** Reads a single `MapMode` that is related to this `MapPool`. */
  mapModeByMapModeId: MapMode;
  mapModeId: Scalars['Int'];
  /** Reads a single `Tournament` that is related to this `MapPool`. */
  tournamentByTournamentIdentifier: Tournament;
  tournamentIdentifier: Scalars['String'];
};

/** A condition to be used against `MapPool` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type MapPoolCondition = {
  /** Checks for equality with the object’s `mapModeId` field. */
  mapModeId?: Maybe<Scalars['Int']>;
  /** Checks for equality with the object’s `tournamentIdentifier` field. */
  tournamentIdentifier?: Maybe<Scalars['String']>;
};

/** An input for mutations affecting `MapPool` */
export type MapPoolInput = {
  mapModeId: Scalars['Int'];
  tournamentIdentifier: Scalars['String'];
};

/** Represents an update to a `MapPool`. Fields that are set will be updated. */
export type MapPoolPatch = {
  mapModeId?: Maybe<Scalars['Int']>;
  tournamentIdentifier?: Maybe<Scalars['String']>;
};

/** A connection to a list of `MapPool` values. */
export type MapPoolsConnection = {
  __typename?: 'MapPoolsConnection';
  /** A list of edges which contains the `MapPool` and cursor to aid in pagination. */
  edges: Array<MapPoolsEdge>;
  /** A list of `MapPool` objects. */
  nodes: Array<MapPool>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `MapPool` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `MapPool` edge in the connection. */
export type MapPoolsEdge = {
  __typename?: 'MapPoolsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `MapPool` at the end of the edge. */
  node: MapPool;
};

/** Methods to use when ordering `MapPool`. */
export enum MapPoolsOrderBy {
  MapModeIdAsc = 'MAP_MODE_ID_ASC',
  MapModeIdDesc = 'MAP_MODE_ID_DESC',
  Natural = 'NATURAL',
  TournamentIdentifierAsc = 'TOURNAMENT_IDENTIFIER_ASC',
  TournamentIdentifierDesc = 'TOURNAMENT_IDENTIFIER_DESC'
}

export enum ModeEnum {
  Cb = 'CB',
  Rm = 'RM',
  Sz = 'SZ',
  Tc = 'TC',
  Tw = 'TW'
}

/** The root mutation type which contains root level fields which mutate data. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Creates a single `Account`. */
  createAccount?: Maybe<CreateAccountPayload>;
  /** Creates a single `MapMode`. */
  createMapMode?: Maybe<CreateMapModePayload>;
  /** Creates a single `MapPool`. */
  createMapPool?: Maybe<CreateMapPoolPayload>;
  /** Creates a single `Organization`. */
  createOrganization?: Maybe<CreateOrganizationPayload>;
  /** Creates a single `Tournament`. */
  createTournament?: Maybe<CreateTournamentPayload>;
  /** Creates a single `TournamentTeam`. */
  createTournamentTeam?: Maybe<CreateTournamentTeamPayload>;
  /** Creates a single `TournamentTeamRoster`. */
  createTournamentTeamRoster?: Maybe<CreateTournamentTeamRosterPayload>;
  /** Deletes a single `Account` using its globally unique id. */
  deleteAccount?: Maybe<DeleteAccountPayload>;
  /** Deletes a single `Account` using a unique key. */
  deleteAccountById?: Maybe<DeleteAccountPayload>;
  /** Deletes a single `MapMode` using its globally unique id. */
  deleteMapMode?: Maybe<DeleteMapModePayload>;
  /** Deletes a single `MapMode` using a unique key. */
  deleteMapModeById?: Maybe<DeleteMapModePayload>;
  /** Deletes a single `MapMode` using a unique key. */
  deleteMapModeByStageAndGameMode?: Maybe<DeleteMapModePayload>;
  /** Deletes a single `MapPool` using a unique key. */
  deleteMapPoolByTournamentIdentifierAndMapModeId?: Maybe<DeleteMapPoolPayload>;
  /** Deletes a single `Organization` using its globally unique id. */
  deleteOrganization?: Maybe<DeleteOrganizationPayload>;
  /** Deletes a single `Organization` using a unique key. */
  deleteOrganizationByIdentifier?: Maybe<DeleteOrganizationPayload>;
  /** Deletes a single `Tournament` using its globally unique id. */
  deleteTournament?: Maybe<DeleteTournamentPayload>;
  /** Deletes a single `Tournament` using a unique key. */
  deleteTournamentByIdentifier?: Maybe<DeleteTournamentPayload>;
  /** Deletes a single `TournamentTeam` using its globally unique id. */
  deleteTournamentTeam?: Maybe<DeleteTournamentTeamPayload>;
  /** Deletes a single `TournamentTeam` using a unique key. */
  deleteTournamentTeamById?: Maybe<DeleteTournamentTeamPayload>;
  /** Deletes a single `TournamentTeam` using a unique key. */
  deleteTournamentTeamByInviteCode?: Maybe<DeleteTournamentTeamPayload>;
  /** Deletes a single `TournamentTeam` using a unique key. */
  deleteTournamentTeamByNameAndTournamentIdentifier?: Maybe<DeleteTournamentTeamPayload>;
  /** Deletes a single `TournamentTeamRoster` using a unique key. */
  deleteTournamentTeamRosterByMemberIdAndTournamentTeamId?: Maybe<DeleteTournamentTeamRosterPayload>;
  /** Updates a single `Account` using its globally unique id and a patch. */
  updateAccount?: Maybe<UpdateAccountPayload>;
  /** Updates a single `Account` using a unique key and a patch. */
  updateAccountById?: Maybe<UpdateAccountPayload>;
  /** Updates a single `MapMode` using its globally unique id and a patch. */
  updateMapMode?: Maybe<UpdateMapModePayload>;
  /** Updates a single `MapMode` using a unique key and a patch. */
  updateMapModeById?: Maybe<UpdateMapModePayload>;
  /** Updates a single `MapMode` using a unique key and a patch. */
  updateMapModeByStageAndGameMode?: Maybe<UpdateMapModePayload>;
  /** Updates a single `MapPool` using a unique key and a patch. */
  updateMapPoolByTournamentIdentifierAndMapModeId?: Maybe<UpdateMapPoolPayload>;
  /** Updates a single `Organization` using its globally unique id and a patch. */
  updateOrganization?: Maybe<UpdateOrganizationPayload>;
  /** Updates a single `Organization` using a unique key and a patch. */
  updateOrganizationByIdentifier?: Maybe<UpdateOrganizationPayload>;
  /** Updates a single `Tournament` using its globally unique id and a patch. */
  updateTournament?: Maybe<UpdateTournamentPayload>;
  /** Updates a single `Tournament` using a unique key and a patch. */
  updateTournamentByIdentifier?: Maybe<UpdateTournamentPayload>;
  /** Updates a single `TournamentTeam` using its globally unique id and a patch. */
  updateTournamentTeam?: Maybe<UpdateTournamentTeamPayload>;
  /** Updates a single `TournamentTeam` using a unique key and a patch. */
  updateTournamentTeamById?: Maybe<UpdateTournamentTeamPayload>;
  /** Updates a single `TournamentTeam` using a unique key and a patch. */
  updateTournamentTeamByInviteCode?: Maybe<UpdateTournamentTeamPayload>;
  /** Updates a single `TournamentTeam` using a unique key and a patch. */
  updateTournamentTeamByNameAndTournamentIdentifier?: Maybe<UpdateTournamentTeamPayload>;
  /** Updates a single `TournamentTeamRoster` using a unique key and a patch. */
  updateTournamentTeamRosterByMemberIdAndTournamentTeamId?: Maybe<UpdateTournamentTeamRosterPayload>;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateMapModeArgs = {
  input: CreateMapModeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateMapPoolArgs = {
  input: CreateMapPoolInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateTournamentArgs = {
  input: CreateTournamentInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateTournamentTeamArgs = {
  input: CreateTournamentTeamInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateTournamentTeamRosterArgs = {
  input: CreateTournamentTeamRosterInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteAccountArgs = {
  input: DeleteAccountInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteAccountByIdArgs = {
  input: DeleteAccountByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteMapModeArgs = {
  input: DeleteMapModeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteMapModeByIdArgs = {
  input: DeleteMapModeByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteMapModeByStageAndGameModeArgs = {
  input: DeleteMapModeByStageAndGameModeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteMapPoolByTournamentIdentifierAndMapModeIdArgs = {
  input: DeleteMapPoolByTournamentIdentifierAndMapModeIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteOrganizationArgs = {
  input: DeleteOrganizationInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteOrganizationByIdentifierArgs = {
  input: DeleteOrganizationByIdentifierInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentArgs = {
  input: DeleteTournamentInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentByIdentifierArgs = {
  input: DeleteTournamentByIdentifierInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentTeamArgs = {
  input: DeleteTournamentTeamInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentTeamByIdArgs = {
  input: DeleteTournamentTeamByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentTeamByInviteCodeArgs = {
  input: DeleteTournamentTeamByInviteCodeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentTeamByNameAndTournamentIdentifierArgs = {
  input: DeleteTournamentTeamByNameAndTournamentIdentifierInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteTournamentTeamRosterByMemberIdAndTournamentTeamIdArgs = {
  input: DeleteTournamentTeamRosterByMemberIdAndTournamentTeamIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateAccountArgs = {
  input: UpdateAccountInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateAccountByIdArgs = {
  input: UpdateAccountByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateMapModeArgs = {
  input: UpdateMapModeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateMapModeByIdArgs = {
  input: UpdateMapModeByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateMapModeByStageAndGameModeArgs = {
  input: UpdateMapModeByStageAndGameModeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateMapPoolByTournamentIdentifierAndMapModeIdArgs = {
  input: UpdateMapPoolByTournamentIdentifierAndMapModeIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateOrganizationByIdentifierArgs = {
  input: UpdateOrganizationByIdentifierInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentArgs = {
  input: UpdateTournamentInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentByIdentifierArgs = {
  input: UpdateTournamentByIdentifierInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentTeamArgs = {
  input: UpdateTournamentTeamInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentTeamByIdArgs = {
  input: UpdateTournamentTeamByIdInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentTeamByInviteCodeArgs = {
  input: UpdateTournamentTeamByInviteCodeInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentTeamByNameAndTournamentIdentifierArgs = {
  input: UpdateTournamentTeamByNameAndTournamentIdentifierInput;
};


/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateTournamentTeamRosterByMemberIdAndTournamentTeamIdArgs = {
  input: UpdateTournamentTeamRosterByMemberIdAndTournamentTeamIdInput;
};

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
};

export type Organization = Node & {
  __typename?: 'Organization';
  /** Reads a single `Account` that is related to this `Organization`. */
  accountByOwnerId: Account;
  createdAt?: Maybe<Scalars['Datetime']>;
  discordInviteCode: Scalars['String'];
  discordInviteUrl?: Maybe<Scalars['String']>;
  identifier: Scalars['String'];
  name: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  ownerId: Scalars['Int'];
  /** Reads and enables pagination through a set of `Tournament`. */
  tournamentsByOrganizationIdentifier: TournamentsConnection;
  twitter?: Maybe<Scalars['String']>;
  twitterUrl?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
};


export type OrganizationTournamentsByOrganizationIdentifierArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentsOrderBy>>;
};

/**
 * A condition to be used against `Organization` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type OrganizationCondition = {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: Maybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `discordInviteCode` field. */
  discordInviteCode?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `identifier` field. */
  identifier?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `name` field. */
  name?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `ownerId` field. */
  ownerId?: Maybe<Scalars['Int']>;
  /** Checks for equality with the object’s `twitter` field. */
  twitter?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `updatedAt` field. */
  updatedAt?: Maybe<Scalars['Datetime']>;
};

/** An input for mutations affecting `Organization` */
export type OrganizationInput = {
  createdAt?: Maybe<Scalars['Datetime']>;
  discordInviteCode: Scalars['String'];
  identifier: Scalars['String'];
  name: Scalars['String'];
  ownerId: Scalars['Int'];
  twitter?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
};

/** Represents an update to a `Organization`. Fields that are set will be updated. */
export type OrganizationPatch = {
  createdAt?: Maybe<Scalars['Datetime']>;
  discordInviteCode?: Maybe<Scalars['String']>;
  identifier?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  ownerId?: Maybe<Scalars['Int']>;
  twitter?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
};

/** A connection to a list of `Organization` values. */
export type OrganizationsConnection = {
  __typename?: 'OrganizationsConnection';
  /** A list of edges which contains the `Organization` and cursor to aid in pagination. */
  edges: Array<OrganizationsEdge>;
  /** A list of `Organization` objects. */
  nodes: Array<Organization>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Organization` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Organization` edge in the connection. */
export type OrganizationsEdge = {
  __typename?: 'OrganizationsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Organization` at the end of the edge. */
  node: Organization;
};

/** Methods to use when ordering `Organization`. */
export enum OrganizationsOrderBy {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DiscordInviteCodeAsc = 'DISCORD_INVITE_CODE_ASC',
  DiscordInviteCodeDesc = 'DISCORD_INVITE_CODE_DESC',
  IdentifierAsc = 'IDENTIFIER_ASC',
  IdentifierDesc = 'IDENTIFIER_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TwitterAsc = 'TWITTER_ASC',
  TwitterDesc = 'TWITTER_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']>;
};

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  __typename?: 'Query';
  /** Reads a single `Account` using its globally unique `ID`. */
  account?: Maybe<Account>;
  accountById?: Maybe<Account>;
  /** Reads and enables pagination through a set of `Account`. */
  allAccounts?: Maybe<AccountsConnection>;
  /** Reads and enables pagination through a set of `MapMode`. */
  allMapModes?: Maybe<MapModesConnection>;
  /** Reads and enables pagination through a set of `MapPool`. */
  allMapPools?: Maybe<MapPoolsConnection>;
  /** Reads and enables pagination through a set of `Organization`. */
  allOrganizations?: Maybe<OrganizationsConnection>;
  /** Reads and enables pagination through a set of `TournamentTeamRoster`. */
  allTournamentTeamRosters?: Maybe<TournamentTeamRostersConnection>;
  /** Reads and enables pagination through a set of `TournamentTeam`. */
  allTournamentTeams?: Maybe<TournamentTeamsConnection>;
  /** Reads and enables pagination through a set of `Tournament`. */
  allTournaments?: Maybe<TournamentsConnection>;
  /** Reads a single `MapMode` using its globally unique `ID`. */
  mapMode?: Maybe<MapMode>;
  mapModeById?: Maybe<MapMode>;
  mapModeByStageAndGameMode?: Maybe<MapMode>;
  mapPoolByTournamentIdentifierAndMapModeId?: Maybe<MapPool>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID'];
  /** Reads a single `Organization` using its globally unique `ID`. */
  organization?: Maybe<Organization>;
  organizationByIdentifier?: Maybe<Organization>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  /** Reads a single `Tournament` using its globally unique `ID`. */
  tournament?: Maybe<Tournament>;
  tournamentByIdentifier?: Maybe<Tournament>;
  /** Reads a single `TournamentTeam` using its globally unique `ID`. */
  tournamentTeam?: Maybe<TournamentTeam>;
  tournamentTeamById?: Maybe<TournamentTeam>;
  tournamentTeamByInviteCode?: Maybe<TournamentTeam>;
  tournamentTeamByNameAndTournamentIdentifier?: Maybe<TournamentTeam>;
  tournamentTeamRosterByMemberIdAndTournamentTeamId?: Maybe<TournamentTeamRoster>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAccountArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryAccountByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QueryAllAccountsArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<AccountCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllMapModesArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<MapModeCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<MapModesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllMapPoolsArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<MapPoolCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<MapPoolsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllOrganizationsArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<OrganizationCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrganizationsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllTournamentTeamRostersArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentTeamRosterCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentTeamRostersOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllTournamentTeamsArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentTeamCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentTeamsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryAllTournamentsArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryMapModeArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMapModeByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMapModeByStageAndGameModeArgs = {
  gameMode: ModeEnum;
  stage: Scalars['String'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMapPoolByTournamentIdentifierAndMapModeIdArgs = {
  mapModeId: Scalars['Int'];
  tournamentIdentifier: Scalars['String'];
};


/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryOrganizationArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryOrganizationByIdentifierArgs = {
  identifier: Scalars['String'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentByIdentifierArgs = {
  identifier: Scalars['String'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentTeamArgs = {
  nodeId: Scalars['ID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentTeamByIdArgs = {
  id: Scalars['Int'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentTeamByInviteCodeArgs = {
  inviteCode: Scalars['UUID'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentTeamByNameAndTournamentIdentifierArgs = {
  name: Scalars['String'];
  tournamentIdentifier: Scalars['String'];
};


/** The root query type which gives access points into the data universe. */
export type QueryTournamentTeamRosterByMemberIdAndTournamentTeamIdArgs = {
  memberId: Scalars['Int'];
  tournamentTeamId: Scalars['Int'];
};

export type Tournament = Node & {
  __typename?: 'Tournament';
  bannerBackground: Scalars['String'];
  bannerTextHslArgs: Scalars['String'];
  checkInTime?: Maybe<Scalars['Datetime']>;
  createdAt?: Maybe<Scalars['Datetime']>;
  description: Scalars['String'];
  identifier: Scalars['String'];
  /** Reads and enables pagination through a set of `MapPool`. */
  mapPoolsByTournamentIdentifier: MapPoolsConnection;
  name: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads a single `Organization` that is related to this `Tournament`. */
  organizationByOrganizationIdentifier: Organization;
  organizationIdentifier: Scalars['String'];
  startTime: Scalars['Datetime'];
  textColor?: Maybe<Scalars['String']>;
  /** Reads and enables pagination through a set of `TournamentTeam`. */
  tournamentTeamsByTournamentIdentifier: TournamentTeamsConnection;
  updatedAt?: Maybe<Scalars['Datetime']>;
};


export type TournamentMapPoolsByTournamentIdentifierArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<MapPoolCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<MapPoolsOrderBy>>;
};


export type TournamentTournamentTeamsByTournamentIdentifierArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentTeamCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentTeamsOrderBy>>;
};

/**
 * A condition to be used against `Tournament` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type TournamentCondition = {
  /** Checks for equality with the object’s `bannerBackground` field. */
  bannerBackground?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `bannerTextHslArgs` field. */
  bannerTextHslArgs?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `checkInTime` field. */
  checkInTime?: Maybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: Maybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `description` field. */
  description?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `identifier` field. */
  identifier?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `name` field. */
  name?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `organizationIdentifier` field. */
  organizationIdentifier?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `startTime` field. */
  startTime?: Maybe<Scalars['Datetime']>;
  /** Checks for equality with the object’s `updatedAt` field. */
  updatedAt?: Maybe<Scalars['Datetime']>;
};

/** An input for mutations affecting `Tournament` */
export type TournamentInput = {
  bannerBackground: Scalars['String'];
  bannerTextHslArgs: Scalars['String'];
  checkInTime?: Maybe<Scalars['Datetime']>;
  createdAt?: Maybe<Scalars['Datetime']>;
  description: Scalars['String'];
  identifier: Scalars['String'];
  name: Scalars['String'];
  organizationIdentifier: Scalars['String'];
  startTime: Scalars['Datetime'];
  updatedAt?: Maybe<Scalars['Datetime']>;
};

/** Represents an update to a `Tournament`. Fields that are set will be updated. */
export type TournamentPatch = {
  bannerBackground?: Maybe<Scalars['String']>;
  bannerTextHslArgs?: Maybe<Scalars['String']>;
  checkInTime?: Maybe<Scalars['Datetime']>;
  createdAt?: Maybe<Scalars['Datetime']>;
  description?: Maybe<Scalars['String']>;
  identifier?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organizationIdentifier?: Maybe<Scalars['String']>;
  startTime?: Maybe<Scalars['Datetime']>;
  updatedAt?: Maybe<Scalars['Datetime']>;
};

export type TournamentTeam = Node & {
  __typename?: 'TournamentTeam';
  checkedIn: Scalars['Boolean'];
  id: Scalars['Int'];
  inviteCode: Scalars['UUID'];
  name: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads a single `Tournament` that is related to this `TournamentTeam`. */
  tournamentByTournamentIdentifier: Tournament;
  tournamentIdentifier: Scalars['String'];
  /** Reads and enables pagination through a set of `TournamentTeamRoster`. */
  tournamentTeamRostersByTournamentTeamId: TournamentTeamRostersConnection;
};


export type TournamentTeamTournamentTeamRostersByTournamentTeamIdArgs = {
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
  condition?: Maybe<TournamentTeamRosterCondition>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TournamentTeamRostersOrderBy>>;
};

/**
 * A condition to be used against `TournamentTeam` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export type TournamentTeamCondition = {
  /** Checks for equality with the object’s `checkedIn` field. */
  checkedIn?: Maybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `id` field. */
  id?: Maybe<Scalars['Int']>;
  /** Checks for equality with the object’s `inviteCode` field. */
  inviteCode?: Maybe<Scalars['UUID']>;
  /** Checks for equality with the object’s `name` field. */
  name?: Maybe<Scalars['String']>;
  /** Checks for equality with the object’s `tournamentIdentifier` field. */
  tournamentIdentifier?: Maybe<Scalars['String']>;
};

/** An input for mutations affecting `TournamentTeam` */
export type TournamentTeamInput = {
  checkedIn?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  inviteCode?: Maybe<Scalars['UUID']>;
  name: Scalars['String'];
  tournamentIdentifier: Scalars['String'];
};

/** Represents an update to a `TournamentTeam`. Fields that are set will be updated. */
export type TournamentTeamPatch = {
  checkedIn?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  inviteCode?: Maybe<Scalars['UUID']>;
  name?: Maybe<Scalars['String']>;
  tournamentIdentifier?: Maybe<Scalars['String']>;
};

export type TournamentTeamRoster = {
  __typename?: 'TournamentTeamRoster';
  /** Reads a single `Account` that is related to this `TournamentTeamRoster`. */
  accountByMemberId: Account;
  captain: Scalars['Boolean'];
  memberId: Scalars['Int'];
  /** Reads a single `TournamentTeam` that is related to this `TournamentTeamRoster`. */
  tournamentTeamByTournamentTeamId: TournamentTeam;
  tournamentTeamId: Scalars['Int'];
};

/**
 * A condition to be used against `TournamentTeamRoster` object types. All fields
 * are tested for equality and combined with a logical ‘and.’
 */
export type TournamentTeamRosterCondition = {
  /** Checks for equality with the object’s `captain` field. */
  captain?: Maybe<Scalars['Boolean']>;
  /** Checks for equality with the object’s `memberId` field. */
  memberId?: Maybe<Scalars['Int']>;
  /** Checks for equality with the object’s `tournamentTeamId` field. */
  tournamentTeamId?: Maybe<Scalars['Int']>;
};

/** An input for mutations affecting `TournamentTeamRoster` */
export type TournamentTeamRosterInput = {
  captain?: Maybe<Scalars['Boolean']>;
  memberId: Scalars['Int'];
  tournamentTeamId: Scalars['Int'];
};

/** Represents an update to a `TournamentTeamRoster`. Fields that are set will be updated. */
export type TournamentTeamRosterPatch = {
  captain?: Maybe<Scalars['Boolean']>;
  memberId?: Maybe<Scalars['Int']>;
  tournamentTeamId?: Maybe<Scalars['Int']>;
};

/** A connection to a list of `TournamentTeamRoster` values. */
export type TournamentTeamRostersConnection = {
  __typename?: 'TournamentTeamRostersConnection';
  /** A list of edges which contains the `TournamentTeamRoster` and cursor to aid in pagination. */
  edges: Array<TournamentTeamRostersEdge>;
  /** A list of `TournamentTeamRoster` objects. */
  nodes: Array<TournamentTeamRoster>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TournamentTeamRoster` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `TournamentTeamRoster` edge in the connection. */
export type TournamentTeamRostersEdge = {
  __typename?: 'TournamentTeamRostersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TournamentTeamRoster` at the end of the edge. */
  node: TournamentTeamRoster;
};

/** Methods to use when ordering `TournamentTeamRoster`. */
export enum TournamentTeamRostersOrderBy {
  CaptainAsc = 'CAPTAIN_ASC',
  CaptainDesc = 'CAPTAIN_DESC',
  MemberIdAsc = 'MEMBER_ID_ASC',
  MemberIdDesc = 'MEMBER_ID_DESC',
  Natural = 'NATURAL',
  TournamentTeamIdAsc = 'TOURNAMENT_TEAM_ID_ASC',
  TournamentTeamIdDesc = 'TOURNAMENT_TEAM_ID_DESC'
}

/** A connection to a list of `TournamentTeam` values. */
export type TournamentTeamsConnection = {
  __typename?: 'TournamentTeamsConnection';
  /** A list of edges which contains the `TournamentTeam` and cursor to aid in pagination. */
  edges: Array<TournamentTeamsEdge>;
  /** A list of `TournamentTeam` objects. */
  nodes: Array<TournamentTeam>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TournamentTeam` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `TournamentTeam` edge in the connection. */
export type TournamentTeamsEdge = {
  __typename?: 'TournamentTeamsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TournamentTeam` at the end of the edge. */
  node: TournamentTeam;
};

/** Methods to use when ordering `TournamentTeam`. */
export enum TournamentTeamsOrderBy {
  CheckedInAsc = 'CHECKED_IN_ASC',
  CheckedInDesc = 'CHECKED_IN_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InviteCodeAsc = 'INVITE_CODE_ASC',
  InviteCodeDesc = 'INVITE_CODE_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TournamentIdentifierAsc = 'TOURNAMENT_IDENTIFIER_ASC',
  TournamentIdentifierDesc = 'TOURNAMENT_IDENTIFIER_DESC'
}

/** A connection to a list of `Tournament` values. */
export type TournamentsConnection = {
  __typename?: 'TournamentsConnection';
  /** A list of edges which contains the `Tournament` and cursor to aid in pagination. */
  edges: Array<TournamentsEdge>;
  /** A list of `Tournament` objects. */
  nodes: Array<Tournament>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Tournament` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Tournament` edge in the connection. */
export type TournamentsEdge = {
  __typename?: 'TournamentsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Tournament` at the end of the edge. */
  node: Tournament;
};

/** Methods to use when ordering `Tournament`. */
export enum TournamentsOrderBy {
  BannerBackgroundAsc = 'BANNER_BACKGROUND_ASC',
  BannerBackgroundDesc = 'BANNER_BACKGROUND_DESC',
  BannerTextHslArgsAsc = 'BANNER_TEXT_HSL_ARGS_ASC',
  BannerTextHslArgsDesc = 'BANNER_TEXT_HSL_ARGS_DESC',
  CheckInTimeAsc = 'CHECK_IN_TIME_ASC',
  CheckInTimeDesc = 'CHECK_IN_TIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  IdentifierAsc = 'IDENTIFIER_ASC',
  IdentifierDesc = 'IDENTIFIER_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  OrganizationIdentifierAsc = 'ORGANIZATION_IDENTIFIER_ASC',
  OrganizationIdentifierDesc = 'ORGANIZATION_IDENTIFIER_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StartTimeAsc = 'START_TIME_ASC',
  StartTimeDesc = 'START_TIME_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** All input for the `updateAccountById` mutation. */
export type UpdateAccountByIdInput = {
  /** An object where the defined keys will be set on the `Account` being updated. */
  accountPatch: AccountPatch;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

/** All input for the `updateAccount` mutation. */
export type UpdateAccountInput = {
  /** An object where the defined keys will be set on the `Account` being updated. */
  accountPatch: AccountPatch;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Account` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `Account` mutation. */
export type UpdateAccountPayload = {
  __typename?: 'UpdateAccountPayload';
  /** The `Account` that was updated by this mutation. */
  account?: Maybe<Account>;
  /** An edge for our `Account`. May be used by Relay 1. */
  accountEdge?: Maybe<AccountsEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `Account` mutation. */
export type UpdateAccountPayloadAccountEdgeArgs = {
  orderBy?: Maybe<Array<AccountsOrderBy>>;
};

/** All input for the `updateMapModeById` mutation. */
export type UpdateMapModeByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `MapMode` being updated. */
  mapModePatch: MapModePatch;
};

/** All input for the `updateMapModeByStageAndGameMode` mutation. */
export type UpdateMapModeByStageAndGameModeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  gameMode: ModeEnum;
  /** An object where the defined keys will be set on the `MapMode` being updated. */
  mapModePatch: MapModePatch;
  stage: Scalars['String'];
};

/** All input for the `updateMapMode` mutation. */
export type UpdateMapModeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** An object where the defined keys will be set on the `MapMode` being updated. */
  mapModePatch: MapModePatch;
  /** The globally unique `ID` which will identify a single `MapMode` to be updated. */
  nodeId: Scalars['ID'];
};

/** The output of our update `MapMode` mutation. */
export type UpdateMapModePayload = {
  __typename?: 'UpdateMapModePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `MapMode` that was updated by this mutation. */
  mapMode?: Maybe<MapMode>;
  /** An edge for our `MapMode`. May be used by Relay 1. */
  mapModeEdge?: Maybe<MapModesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `MapMode` mutation. */
export type UpdateMapModePayloadMapModeEdgeArgs = {
  orderBy?: Maybe<Array<MapModesOrderBy>>;
};

/** All input for the `updateMapPoolByTournamentIdentifierAndMapModeId` mutation. */
export type UpdateMapPoolByTournamentIdentifierAndMapModeIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  mapModeId: Scalars['Int'];
  /** An object where the defined keys will be set on the `MapPool` being updated. */
  mapPoolPatch: MapPoolPatch;
  tournamentIdentifier: Scalars['String'];
};

/** The output of our update `MapPool` mutation. */
export type UpdateMapPoolPayload = {
  __typename?: 'UpdateMapPoolPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reads a single `MapMode` that is related to this `MapPool`. */
  mapModeByMapModeId: MapMode;
  /** The `MapPool` that was updated by this mutation. */
  mapPool?: Maybe<MapPool>;
  /** An edge for our `MapPool`. May be used by Relay 1. */
  mapPoolEdge?: Maybe<MapPoolsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Tournament` that is related to this `MapPool`. */
  tournamentByTournamentIdentifier: Tournament;
};


/** The output of our update `MapPool` mutation. */
export type UpdateMapPoolPayloadMapPoolEdgeArgs = {
  orderBy?: Maybe<Array<MapPoolsOrderBy>>;
};

/** All input for the `updateOrganizationByIdentifier` mutation. */
export type UpdateOrganizationByIdentifierInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  identifier: Scalars['String'];
  /** An object where the defined keys will be set on the `Organization` being updated. */
  organizationPatch: OrganizationPatch;
};

/** All input for the `updateOrganization` mutation. */
export type UpdateOrganizationInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Organization` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `Organization` being updated. */
  organizationPatch: OrganizationPatch;
};

/** The output of our update `Organization` mutation. */
export type UpdateOrganizationPayload = {
  __typename?: 'UpdateOrganizationPayload';
  /** Reads a single `Account` that is related to this `Organization`. */
  accountByOwnerId: Account;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The `Organization` that was updated by this mutation. */
  organization?: Maybe<Organization>;
  /** An edge for our `Organization`. May be used by Relay 1. */
  organizationEdge?: Maybe<OrganizationsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};


/** The output of our update `Organization` mutation. */
export type UpdateOrganizationPayloadOrganizationEdgeArgs = {
  orderBy?: Maybe<Array<OrganizationsOrderBy>>;
};

/** All input for the `updateTournamentByIdentifier` mutation. */
export type UpdateTournamentByIdentifierInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  identifier: Scalars['String'];
  /** An object where the defined keys will be set on the `Tournament` being updated. */
  tournamentPatch: TournamentPatch;
};

/** All input for the `updateTournament` mutation. */
export type UpdateTournamentInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `Tournament` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `Tournament` being updated. */
  tournamentPatch: TournamentPatch;
};

/** The output of our update `Tournament` mutation. */
export type UpdateTournamentPayload = {
  __typename?: 'UpdateTournamentPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reads a single `Organization` that is related to this `Tournament`. */
  organizationByOrganizationIdentifier: Organization;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Tournament` that was updated by this mutation. */
  tournament?: Maybe<Tournament>;
  /** An edge for our `Tournament`. May be used by Relay 1. */
  tournamentEdge?: Maybe<TournamentsEdge>;
};


/** The output of our update `Tournament` mutation. */
export type UpdateTournamentPayloadTournamentEdgeArgs = {
  orderBy?: Maybe<Array<TournamentsOrderBy>>;
};

/** All input for the `updateTournamentTeamById` mutation. */
export type UpdateTournamentTeamByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  /** An object where the defined keys will be set on the `TournamentTeam` being updated. */
  tournamentTeamPatch: TournamentTeamPatch;
};

/** All input for the `updateTournamentTeamByInviteCode` mutation. */
export type UpdateTournamentTeamByInviteCodeInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  inviteCode: Scalars['UUID'];
  /** An object where the defined keys will be set on the `TournamentTeam` being updated. */
  tournamentTeamPatch: TournamentTeamPatch;
};

/** All input for the `updateTournamentTeamByNameAndTournamentIdentifier` mutation. */
export type UpdateTournamentTeamByNameAndTournamentIdentifierInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  tournamentIdentifier: Scalars['String'];
  /** An object where the defined keys will be set on the `TournamentTeam` being updated. */
  tournamentTeamPatch: TournamentTeamPatch;
};

/** All input for the `updateTournamentTeam` mutation. */
export type UpdateTournamentTeamInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The globally unique `ID` which will identify a single `TournamentTeam` to be updated. */
  nodeId: Scalars['ID'];
  /** An object where the defined keys will be set on the `TournamentTeam` being updated. */
  tournamentTeamPatch: TournamentTeamPatch;
};

/** The output of our update `TournamentTeam` mutation. */
export type UpdateTournamentTeamPayload = {
  __typename?: 'UpdateTournamentTeamPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Tournament` that is related to this `TournamentTeam`. */
  tournamentByTournamentIdentifier: Tournament;
  /** The `TournamentTeam` that was updated by this mutation. */
  tournamentTeam?: Maybe<TournamentTeam>;
  /** An edge for our `TournamentTeam`. May be used by Relay 1. */
  tournamentTeamEdge?: Maybe<TournamentTeamsEdge>;
};


/** The output of our update `TournamentTeam` mutation. */
export type UpdateTournamentTeamPayloadTournamentTeamEdgeArgs = {
  orderBy?: Maybe<Array<TournamentTeamsOrderBy>>;
};

/** All input for the `updateTournamentTeamRosterByMemberIdAndTournamentTeamId` mutation. */
export type UpdateTournamentTeamRosterByMemberIdAndTournamentTeamIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  memberId: Scalars['Int'];
  tournamentTeamId: Scalars['Int'];
  /** An object where the defined keys will be set on the `TournamentTeamRoster` being updated. */
  tournamentTeamRosterPatch: TournamentTeamRosterPatch;
};

/** The output of our update `TournamentTeamRoster` mutation. */
export type UpdateTournamentTeamRosterPayload = {
  __typename?: 'UpdateTournamentTeamRosterPayload';
  /** Reads a single `Account` that is related to this `TournamentTeamRoster`. */
  accountByMemberId: Account;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `TournamentTeam` that is related to this `TournamentTeamRoster`. */
  tournamentTeamByTournamentTeamId: TournamentTeam;
  /** The `TournamentTeamRoster` that was updated by this mutation. */
  tournamentTeamRoster?: Maybe<TournamentTeamRoster>;
  /** An edge for our `TournamentTeamRoster`. May be used by Relay 1. */
  tournamentTeamRosterEdge?: Maybe<TournamentTeamRostersEdge>;
};


/** The output of our update `TournamentTeamRoster` mutation. */
export type UpdateTournamentTeamRosterPayloadTournamentTeamRosterEdgeArgs = {
  orderBy?: Maybe<Array<TournamentTeamRostersOrderBy>>;
};

export type TournamentByIdentifierQueryVariables = Exact<{
  identifier: Scalars['String'];
}>;


export type TournamentByIdentifierQuery = { __typename?: 'Query', tournamentByIdentifier?: { __typename?: 'Tournament', name: string, startTime: Date, checkInTime?: Date | null | undefined, bannerBackground: string, description: string, textColor?: string | null | undefined, organizationByOrganizationIdentifier: { __typename?: 'Organization', name: string, discordInviteUrl?: string | null | undefined, twitterUrl?: string | null | undefined }, tournamentTeamsByTournamentIdentifier: { __typename?: 'TournamentTeamsConnection', nodes: Array<{ __typename?: 'TournamentTeam', name: string, tournamentTeamRostersByTournamentTeamId: { __typename?: 'TournamentTeamRostersConnection', nodes: Array<{ __typename?: 'TournamentTeamRoster', captain: boolean, accountByMemberId: { __typename?: 'Account', discordFullUsername?: string | null | undefined } }> } }> }, mapPoolsByTournamentIdentifier: { __typename?: 'MapPoolsConnection', nodes: Array<{ __typename?: 'MapPool', mapModeByMapModeId: { __typename?: 'MapMode', stage: string, gameMode: ModeEnum } }> } } | null | undefined };


export const TournamentByIdentifierDocument = gql`
    query TournamentByIdentifier($identifier: String!) {
  tournamentByIdentifier(identifier: $identifier) {
    name
    startTime
    checkInTime
    bannerBackground
    description
    textColor
    organizationByOrganizationIdentifier {
      name
      discordInviteUrl
      twitterUrl
    }
    tournamentTeamsByTournamentIdentifier {
      nodes {
        name
        tournamentTeamRostersByTournamentTeamId {
          nodes {
            captain
            accountByMemberId {
              discordFullUsername
            }
          }
        }
      }
    }
    mapPoolsByTournamentIdentifier {
      nodes {
        mapModeByMapModeId {
          stage
          gameMode
        }
      }
    }
  }
}
    `;

export function useTournamentByIdentifierQuery(options: Omit<Urql.UseQueryArgs<TournamentByIdentifierQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<TournamentByIdentifierQuery>({ query: TournamentByIdentifierDocument, ...options });
};