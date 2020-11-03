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

export type User = {
  __typename?: 'User';
  id: Scalars['Int'];
  discordId: Scalars['String'];
  fullUsername: Scalars['String'];
  avatarUrl?: Maybe<Scalars['String']>;
  profilePath: Scalars['String'];
  profile?: Maybe<Profile>;
};

export type Profile = {
  __typename?: 'Profile';
  twitterName?: Maybe<Scalars['String']>;
  customUrlPath?: Maybe<Scalars['String']>;
  twitchName?: Maybe<Scalars['String']>;
  youtubeId?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  sensStick?: Maybe<Scalars['Float']>;
  sensMotion?: Maybe<Scalars['Float']>;
  weaponPool: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  getUserByIdentifier?: Maybe<User>;
  getXRankPlacements: Array<XRankPlacement>;
  getPlayersXRankPlacements: Array<XRankPlacement>;
};


export type QueryGetUserByIdentifierArgs = {
  identifier: Scalars['String'];
};


export type QueryGetXRankPlacementsArgs = {
  year: Scalars['Int'];
  month: Scalars['Int'];
  mode: RankedMode;
};


export type QueryGetPlayersXRankPlacementsArgs = {
  playerId: Scalars['String'];
};

export type UpdateUserProfileInput = {
  twitterName?: Maybe<Scalars['String']>;
  customUrlPath?: Maybe<Scalars['String']>;
  twitchName?: Maybe<Scalars['String']>;
  youtubeId?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  sensStick?: Maybe<Scalars['Float']>;
  sensMotion?: Maybe<Scalars['Float']>;
  weaponPool: Array<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  updateUserProfile: Scalars['Boolean'];
};


export type MutationUpdateUserProfileArgs = {
  profile: UpdateUserProfileInput;
};

export type XRankPlacement = {
  __typename?: 'XRankPlacement';
  id: Scalars['Int'];
  playerId: Scalars['String'];
  playerName: Scalars['String'];
  ranking: Scalars['Int'];
  xPower: Scalars['Float'];
  weapon: Scalars['String'];
  mode: RankedMode;
  month: Scalars['Int'];
  year: Scalars['Int'];
  player: Player;
};

export type Player = {
  __typename?: 'Player';
  playerId: Scalars['String'];
  /** Set of names player has had in Top 500 results. The most recent one is the first one of the list. */
  names: Array<Scalars['String']>;
  user?: Maybe<User>;
  placements: Array<XRankPlacement>;
};


export type PlayerPlacementsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<XRankPlacementWhereUniqueInput>;
  after?: Maybe<XRankPlacementWhereUniqueInput>;
};

export enum RankedMode {
  Sz = 'SZ',
  Tc = 'TC',
  Rm = 'RM',
  Cb = 'CB'
}

export type XRankPlacementWhereUniqueInput = {
  id?: Maybe<Scalars['Int']>;
  playerId_mode_month_year?: Maybe<PlayerIdModeMonthYearCompoundUniqueInput>;
};

export type PlayerIdModeMonthYearCompoundUniqueInput = {
  playerId: Scalars['String'];
  mode: RankedMode;
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export type GetPlayersXRankPlacementsQueryVariables = Exact<{
  playerId: Scalars['String'];
}>;


export type GetPlayersXRankPlacementsQuery = (
  { __typename?: 'Query' }
  & { getPlayersXRankPlacements: Array<(
    { __typename?: 'XRankPlacement' }
    & Pick<XRankPlacement, 'id' | 'playerName' | 'ranking' | 'xPower' | 'weapon' | 'mode' | 'month' | 'year'>
    & { player: (
      { __typename?: 'Player' }
      & { user?: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'avatarUrl' | 'fullUsername' | 'profilePath'>
      )> }
    ) }
  )> }
);

export type UpdateUserProfileMutationVariables = Exact<{
  profile: UpdateUserProfileInput;
}>;


export type UpdateUserProfileMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'updateUserProfile'>
);

export type GetUserByIdentifierQueryVariables = Exact<{
  identifier: Scalars['String'];
}>;


export type GetUserByIdentifierQuery = (
  { __typename?: 'Query' }
  & { getUserByIdentifier?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'fullUsername' | 'avatarUrl'>
    & { profile?: Maybe<(
      { __typename?: 'Profile' }
      & Pick<Profile, 'customUrlPath' | 'twitterName' | 'twitchName' | 'youtubeId' | 'country' | 'bio' | 'sensMotion' | 'sensStick' | 'weaponPool'>
    )> }
  )> }
);

export type GetXRankPlacementsQueryVariables = Exact<{
  month: Scalars['Int'];
  year: Scalars['Int'];
  mode: RankedMode;
}>;


export type GetXRankPlacementsQuery = (
  { __typename?: 'Query' }
  & { getXRankPlacements: Array<(
    { __typename?: 'XRankPlacement' }
    & Pick<XRankPlacement, 'playerId' | 'playerName' | 'ranking' | 'xPower' | 'weapon' | 'mode'>
    & { player: (
      { __typename?: 'Player' }
      & { user?: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'avatarUrl' | 'fullUsername' | 'profilePath'>
      )> }
    ) }
  )> }
);


export const GetPlayersXRankPlacementsDocument = gql`
    query getPlayersXRankPlacements($playerId: String!) {
  getPlayersXRankPlacements(playerId: $playerId) {
    id
    playerName
    ranking
    xPower
    weapon
    mode
    month
    year
    player {
      user {
        avatarUrl
        fullUsername
        profilePath
      }
    }
  }
}
    `;

/**
 * __useGetPlayersXRankPlacementsQuery__
 *
 * To run a query within a React component, call `useGetPlayersXRankPlacementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlayersXRankPlacementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlayersXRankPlacementsQuery({
 *   variables: {
 *      playerId: // value for 'playerId'
 *   },
 * });
 */
export function useGetPlayersXRankPlacementsQuery(baseOptions?: Apollo.QueryHookOptions<GetPlayersXRankPlacementsQuery, GetPlayersXRankPlacementsQueryVariables>) {
        return Apollo.useQuery<GetPlayersXRankPlacementsQuery, GetPlayersXRankPlacementsQueryVariables>(GetPlayersXRankPlacementsDocument, baseOptions);
      }
export function useGetPlayersXRankPlacementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPlayersXRankPlacementsQuery, GetPlayersXRankPlacementsQueryVariables>) {
          return Apollo.useLazyQuery<GetPlayersXRankPlacementsQuery, GetPlayersXRankPlacementsQueryVariables>(GetPlayersXRankPlacementsDocument, baseOptions);
        }
export type GetPlayersXRankPlacementsQueryHookResult = ReturnType<typeof useGetPlayersXRankPlacementsQuery>;
export type GetPlayersXRankPlacementsLazyQueryHookResult = ReturnType<typeof useGetPlayersXRankPlacementsLazyQuery>;
export type GetPlayersXRankPlacementsQueryResult = Apollo.QueryResult<GetPlayersXRankPlacementsQuery, GetPlayersXRankPlacementsQueryVariables>;
export const UpdateUserProfileDocument = gql`
    mutation UpdateUserProfile($profile: UpdateUserProfileInput!) {
  updateUserProfile(profile: $profile)
}
    `;
export type UpdateUserProfileMutationFn = Apollo.MutationFunction<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;

/**
 * __useUpdateUserProfileMutation__
 *
 * To run a mutation, you first call `useUpdateUserProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserProfileMutation, { data, loading, error }] = useUpdateUserProfileMutation({
 *   variables: {
 *      profile: // value for 'profile'
 *   },
 * });
 */
export function useUpdateUserProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>) {
        return Apollo.useMutation<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>(UpdateUserProfileDocument, baseOptions);
      }
export type UpdateUserProfileMutationHookResult = ReturnType<typeof useUpdateUserProfileMutation>;
export type UpdateUserProfileMutationResult = Apollo.MutationResult<UpdateUserProfileMutation>;
export type UpdateUserProfileMutationOptions = Apollo.BaseMutationOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const GetUserByIdentifierDocument = gql`
    query GetUserByIdentifier($identifier: String!) {
  getUserByIdentifier(identifier: $identifier) {
    id
    fullUsername
    avatarUrl
    profile {
      customUrlPath
      twitterName
      twitchName
      youtubeId
      country
      bio
      sensMotion
      sensStick
      weaponPool
    }
  }
}
    `;

/**
 * __useGetUserByIdentifierQuery__
 *
 * To run a query within a React component, call `useGetUserByIdentifierQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByIdentifierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByIdentifierQuery({
 *   variables: {
 *      identifier: // value for 'identifier'
 *   },
 * });
 */
export function useGetUserByIdentifierQuery(baseOptions?: Apollo.QueryHookOptions<GetUserByIdentifierQuery, GetUserByIdentifierQueryVariables>) {
        return Apollo.useQuery<GetUserByIdentifierQuery, GetUserByIdentifierQueryVariables>(GetUserByIdentifierDocument, baseOptions);
      }
export function useGetUserByIdentifierLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserByIdentifierQuery, GetUserByIdentifierQueryVariables>) {
          return Apollo.useLazyQuery<GetUserByIdentifierQuery, GetUserByIdentifierQueryVariables>(GetUserByIdentifierDocument, baseOptions);
        }
export type GetUserByIdentifierQueryHookResult = ReturnType<typeof useGetUserByIdentifierQuery>;
export type GetUserByIdentifierLazyQueryHookResult = ReturnType<typeof useGetUserByIdentifierLazyQuery>;
export type GetUserByIdentifierQueryResult = Apollo.QueryResult<GetUserByIdentifierQuery, GetUserByIdentifierQueryVariables>;
export const GetXRankPlacementsDocument = gql`
    query getXRankPlacements($month: Int!, $year: Int!, $mode: RankedMode!) {
  getXRankPlacements(month: $month, year: $year, mode: $mode) {
    playerId
    playerName
    ranking
    xPower
    weapon
    mode
    player {
      user {
        avatarUrl
        fullUsername
        profilePath
      }
    }
  }
}
    `;

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
 *      month: // value for 'month'
 *      year: // value for 'year'
 *      mode: // value for 'mode'
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