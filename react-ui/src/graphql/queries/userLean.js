import { gql } from 'apollo-boost'

export const userLean = gql`
{
  user {
    username
    avatar
    discord_id
  }
}
`