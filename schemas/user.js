const { UserInputError, gql } = require("apollo-server-express")
const User = require("../models/user")
const countries = require("../utils/countries")
const weapons = require("../utils/weapons")
require("dotenv").config()

const typeDef = gql`
  extend type Query {
    "Returns the current logged in user or null if not logged in."
    user: User
    "Returns user. Either discord_id or twitter has to provided or error is thrown."
    searchForUser(discord_id: String, twitter: String): User
  }
  extend type Mutation {
    updateUser(
      country: String
      motion_sens: Float
      stick_sens: Float
      weapons: [String]
    ): Boolean
  }
  "The control sensitivity used in Splatoon 2"
  type Sens {
    stick: Float
    motion: Float
  }
  "Represents user account. Also includes info regarding solo ladder."
  type User {
    id: ID!
    "User's username. This is the same as their name on Discord. Updated on every log-in."
    username: String!
    "Discord discriminator. For example with Sendou#0043 0043 is the discriminator."
    discriminator: String!
    "String that allows finding users avatar on Discord."
    discord_id: String!
    twitch_name: String
    twitter_name: String
    country: String
    sens: Sens
    weapons: [String]!
  }
`
const resolvers = {
  Query: {
    user: (root, args, ctx) => {
      if (process.env.NODE_ENV === "development") {
        return {
          id: "5cee8f73d1120d4315c55011",
          discord_id: "79237403620945920",
          __v: 0,
          avatar: "2e292c1b5d1366c24a9e4b6c1cffc700",
          discriminator: "0043",
          twitch_name: "sendou",
          twitter_name: "sendouc",
          username: "Sendou",
        }
      }
      return ctx.user
    },
    searchForUser: (root, args) => {
      let searchCriteria = {}
      if (args.twitter) searchCriteria = { twitter_name: args.twitter }
      else if (args.discord_id) searchCriteria = { discord_id: args.discord_id }
      else
        throw new UserInputError("no twitter or discord id provided", {
          invalidArgs: args,
        })
      return User.findOne(searchCriteria).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
    },
  },
  Mutation: {
    updateUser: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("not authenticated")
      if (args.country)
        if (
          countries
            .map(countryObj => countryObj.code)
            .includes(args.country === -1)
        ) {
          throw new UserInputError("Invalid country ID", {
            invalidArgs: args,
          })
        }

      if (args.stick_sens) {
        const number = Math.floor(args.stick_sens * 10)
        if (number < -50 || number > 50 || number % 5 != 0) {
          throw new UserInputError("Invalid motion sensitivity", {
            invalidArgs: args,
          })
        }

        args.sens = {}
        args.sens.stick = args.stick_sens
        delete args.stick_sens
      }

      if (args.motion_sens) {
        const number = Math.floor(args.motion_sens * 10)
        if (number < -50 || number > 50 || number % 5 != 0) {
          throw new UserInputError("Invalid motion sensitivity", {
            invalidArgs: args,
          })
        }

        if (!args.sens) {
          throw new UserInputError("Motion sens input without stick sens", {
            invalidArgs: args,
          })
        }

        args.sens.motion = args.motion_sens
        delete args.motion_sens
      }

      if (args.weapons) {
        if (args.weapons.some(weapon => weapons.indexOf(weapon) === -1)) {
          throw new UserInputError("Invalid weapon in the pool", {
            invalidArgs: args,
          })
        }

        if (args.weapons.length > 5) {
          throw new UserInputError("Weapon pool too big", {
            invalidArgs: args,
          })
        }
      }

      const user = await User.findById(ctx.user._id)
      if (!user)
        throw new UserInputError("No user found with the id", {
          invalidArgs: args,
        })

      await User.findByIdAndUpdate(ctx.user._id, { ...args }).catch(e => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })

      return true
    },
  },
}

module.exports = {
  User: typeDef,
  userResolvers: resolvers,
}
