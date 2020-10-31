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
  xRankPlacements: Array<XRankPlacement>;
};


export type QueryGetUserByIdentifierArgs = {
  identifier: Scalars['String'];
};


export type QueryXRankPlacementsArgs = {
  orderBy?: Maybe<Array<QueryXRankPlacementsOrderByInput>>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<XRankPlacementWhereUniqueInput>;
  after?: Maybe<XRankPlacementWhereUniqueInput>;
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

export type QueryXRankPlacementsOrderByInput = {
  ranking?: Maybe<SortOrder>;
  month?: Maybe<SortOrder>;
  year?: Maybe<SortOrder>;
};

export type PlayerIdModeMonthYearCompoundUniqueInput = {
  playerId: Scalars['String'];
  mode: RankedMode;
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

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

export type XRankPlacementsQueryVariables = Exact<{ [key: string]: never; }>;


export type XRankPlacementsQuery = (
  { __typename?: 'Query' }
  & { xRankPlacements: Array<(
    { __typename?: 'XRankPlacement' }
    & Pick<XRankPlacement, 'id' | 'playerId' | 'playerName' | 'ranking' | 'xPower' | 'weapon' | 'mode' | 'month' | 'year'>
  )> }
);


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
export const XRankPlacementsDocument = gql`
    query XRankPlacements {
  xRankPlacements(orderBy: [{ranking: asc}, {month: desc}, {year: desc}]) {
    id
    playerId
    playerName
    ranking
    xPower
    weapon
    mode
    month
    year
  }
}
    `;

/**
 * __useXRankPlacementsQuery__
 *
 * To run a query within a React component, call `useXRankPlacementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useXRankPlacementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useXRankPlacementsQuery({
 *   variables: {
 *   },
 * });
 */
export function useXRankPlacementsQuery(baseOptions?: Apollo.QueryHookOptions<XRankPlacementsQuery, XRankPlacementsQueryVariables>) {
        return Apollo.useQuery<XRankPlacementsQuery, XRankPlacementsQueryVariables>(XRankPlacementsDocument, baseOptions);
      }
export function useXRankPlacementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<XRankPlacementsQuery, XRankPlacementsQueryVariables>) {
          return Apollo.useLazyQuery<XRankPlacementsQuery, XRankPlacementsQueryVariables>(XRankPlacementsDocument, baseOptions);
        }
export type XRankPlacementsQueryHookResult = ReturnType<typeof useXRankPlacementsQuery>;
export type XRankPlacementsLazyQueryHookResult = ReturnType<typeof useXRankPlacementsLazyQuery>;
export type XRankPlacementsQueryResult = Apollo.QueryResult<XRankPlacementsQuery, XRankPlacementsQueryVariables>;