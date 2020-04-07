const { UserInputError, gql } = require("apollo-server-express")
const User = require("../mongoose-models/user")
const Player = require("../mongoose-models/player")
const countries = require("../utils/countries")
const weapons = require("../utils/weapons")
require("dotenv").config()

const typeDef = gql`
  extend type Query {
    "Returns the current logged in user or null if not logged in."
    user: User
    "Returns user. Either discord_id or twitter has to provided or error is thrown."
    searchForUser(discord_id: String, twitter: String, custom_url: String): User
    "Returns all users"
    users: [User!]!
  }
  extend type Mutation {
    updateUser(
      country: String
      motion_sens: Float
      stick_sens: Float
      weapons: [String!]
      custom_url: String
      bio: String
    ): Boolean
  }

  "The control sensitivity used in Splatoon 2"
  type Sens {
    stick: Float
    motion: Float
  }

  "Represents user account."
  type User {
    id: ID!
    "User's username. This is the same as their name on Discord. Updated on every log-in."
    username: String!
    "Discord discriminator. For example with Sendou#0043 0043 is the discriminator."
    discriminator: String!
    discord_id: String!
    twitch_name: String
    twitter_name: String
    country: String
    sens: Sens
    bio: String
    weapons: [String!]
    custom_url: String
    top500: Boolean!
  }
`
const resolvers = {
  User: {
    top500: async (root) => {
      if (typeof root.top500 === "boolean") return root.top500

      if (!root.twitter_name) {
        await User.findByIdAndUpdate(root._id, { top500: false })
        return false
      }

      const player = await Player.findOne({ twitter: root.twitter_name }).catch(
        (e) => {
          throw (
            (new UserInputError(),
            {
              invalidArgs: args,
            })
          )
        }
      )

      if (!player) {
        await User.findByIdAndUpdate(root._id, { top500: false })
        return false
      }

      await User.findByIdAndUpdate(root._id, { top500: true })
      return true
    },
  },
  Query: {
    user: (root, args, ctx) => {
      if (process.env.LOGGED_IN) {
        return {
          id: "5cee8f73d1120d4315c55011",
          team: "5e3ecc0ea7dd3830303eaaa7",
          discord_id: "79237403620945920",
          __v: 0,
          avatar: "2e292c1b5d1366c24a9e4b6c1cffc700",
          discriminator: "0043",
          twitch_name: "sendou",
          twitter_name: "sendouc",
          username: "Sendou",
          top500: true,
          custom_url: "sendou",
          plus: {
            membership_status: "ONE",
            vouch_status: null,
            plus_region: "EU",
            can_vouch: "ONE",
          },
        }
      }
      return ctx.user
    },
    searchForUser: (root, args) => {
      let searchCriteria = {}
      if (args.twitter) searchCriteria = { twitter_name: args.twitter }
      else if (args.discord_id) searchCriteria = { discord_id: args.discord_id }
      else if (args.custom_url)
        searchCriteria = { custom_url: args.custom_url.toLowerCase() }
      else
        throw new UserInputError("no search criteria provided", {
          invalidArgs: args,
        })

      return User.findOne(searchCriteria).catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
    },
    users: (root, args) => {
      return User.find({})
        .sort({ username: "asc" })
        .catch((e) => {
          throw new Error(e.message)
        })
    },
  },
  Mutation: {
    updateUser: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("not authenticated")
      if (args.country)
        if (
          countries
            .map((countryObj) => countryObj.code)
            .includes(args.country === -1)
        ) {
          throw new UserInputError("Invalid country ID", {
            invalidArgs: args,
          })
        }

      if (args.stick_sens !== null) {
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

      if (args.motion_sens !== null) {
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
        if (args.weapons.some((weapon) => weapons.indexOf(weapon) === -1)) {
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

      if (args.bio && args.bio.length > 1000000) {
        throw new UserInputError("bio too long", {
          invalidArgs: args,
        })
      }

      const user = ctx.user

      if (args.custom_url) {
        const url = args.custom_url.toLowerCase()
        if (user.custom_url && user.custom_url !== url)
          throw new UserInputError("Custom URL already set")
        if (
          url.length < 2 ||
          url.length > 32 ||
          !isNaN(url) ||
          !/^[a-z0-9]+$/i.test(url)
        ) {
          throw new UserInputError("Invalid custom URL provided", {
            invalidArgs: args,
          })
        }

        const userWithCustomUrl = await User.findOne({ custom_url: url }).catch(
          (e) => {
            throw new Error(error.message)
          }
        )

        if (
          userWithCustomUrl &&
          userWithCustomUrl.discord_id !== user.discord_id
        )
          throw new UserInputError(
            "Some other user already claimed this custom URL"
          )

        args.custom_url = url
      }

      await User.findByIdAndUpdate(ctx.user._id, { ...args }).catch((e) => {
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
