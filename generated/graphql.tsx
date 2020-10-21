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
};


export type QueryGetUserByIdentifierArgs = {
  identifier: Scalars['String'];
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
  weaponPool?: Maybe<Array<Scalars['String']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  updateUserProfile: Scalars['Boolean'];
};


export type MutationUpdateUserProfileArgs = {
  profile?: Maybe<UpdateUserProfileInput>;
};

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
    & Pick<User, 'fullUsername' | 'avatarUrl'>
    & { profile?: Maybe<(
      { __typename?: 'Profile' }
      & Pick<Profile, 'customUrlPath' | 'twitterName' | 'twitchName' | 'youtubeId' | 'country' | 'bio' | 'sensMotion' | 'sensStick' | 'weaponPool'>
    )> }
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