import { gql } from './node_modules/apollo-boost'

export const addBuild = gql`
mutation updateTwitter ($unique_id: String!, $twitter: String!) {
   updateTwitter(
     unique_id: $unique_id,
     twitter: $twitter
   )
}
`