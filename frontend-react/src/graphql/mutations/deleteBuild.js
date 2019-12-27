import { gql } from 'apollo-boost'

export const deleteBuild = gql`
mutation deleteBuild ($id: ID!) {
  deleteBuild(id: $id)
}
`