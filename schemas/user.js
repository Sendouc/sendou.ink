const { UserInputError, gql } = require('apollo-server-express')
const User = require('../models/user')

const typeDef = gql`
  extend type Query {
    "Returns the current logged in user or null if not logged in."
    user: User
    "Returns user. Either discord_id or twitter has to provided or error is thrown."
    searchForUser(discord_id: String twitter: String): User
  }
  "Represents user account. Also includes info regarding solo ladder."
  type User {
    "User's username. This is the same as their name on Discord. Updated on every log-in."
    username: String!
    "Discord discriminator. For example with Sendou#0043 0043 is the discriminator."
    discriminator: String!
    "String that allows finding users avatar on Discord."
    avatar: String
    discord_id: String!
    twitch_name: String
    twitter_name: String
    "Default = [25.0, 25.0 / 3.0] used for TrueSkill ranking https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/"
    solo_power: Float!
    solo_wins: Int!
    solo_losses: Int!
    "Array with max length of 5 containing Discord ID's on opponents previously faced."
    previous_opponents: [String!]
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