const { UserInputError, gql } = require('apollo-server-express')
const User = require('../models/user')

const typeDef = gql`
  extend type Query {
    user: User
    searchForUser(discord_id: String twitter: String): User
  }

  type User {
    username: String!
    discriminator: String!
    avatar: String
    discord_id: String!
    twitch_name: String
    twitter_name: String
    custom_url: String
  }
`
const resolvers = {
  Query: {
    user: (root, args, ctx) => {
      return ctx.user
    },
    searchForUser: (root, args) => {
      let searchCriteria = {}
      if (args.twitter) searchCriteria = {twitter_name: args.twitter}
      else if (args.discord_id) searchCriteria = {discord_id: args.discord_id}
      else throw new UserInputError('no twitter or discord id provided', {
        invalidArgs: args,
      })
      return User
        .findOne(searchCriteria)
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    }
  }
}

module.exports = {
  User: typeDef,
  userResolvers: resolvers
}