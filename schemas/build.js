const { UserInputError, AuthenticationError, gql } = require('apollo-server-express')
const Build = require('../models/build')
const User = require('../models/user')
const Player = require('../models/player')
const weapons = require('../utils/weapons')

const typeDef = gql`
  extend type Query {
    searchForBuilds(discord_id: String!): [Build]!
    searchForBuildsByWeapon(weapon: String! page: Int): BuildCollection!
  }
  extend type Mutation {
    addBuild(
      weapon: String!
      title: String
      headgear: [Ability!]!
      clothing: [Ability!]!
      shoes: [Ability!]!
    ): Build
    deleteBuild(
      id: ID!
    ): Boolean
    updateBuild(
      id: ID!
      weapon: String!
      title: String
      headgear: [Ability!]!
      clothing: [Ability!]!
      shoes: [Ability!]!
    ): Boolean
  }
  type Build {
    id: ID!
    discord_id: String!
    weapon: String!
    title: String
    headgear: [Ability!]!
    clothing: [Ability!]!
    shoes: [Ability!]!
    updatedAt: String!
    top: Boolean!
    discord_user: User!
  }
  type BuildCollection {
    builds: [Build]!
    pageCount: Int!
  }
  enum Ability {
    CB
    LDE
    OG
    T
    H
    NS
    RP
    TI
    DR
    OS
    SJ
    BDU
    REC
    RES
    ISM
    ISS
    MPU
    QR
    QSJ
    RSU
    SSU
    SCU
    SPU
    SS
    BRU
  }
`
const resolvers = {
  Query: {
    searchForBuilds: (root, args) => {
      return Build
        .find({ discord_id: args.discord_id })
        .sort({'weapon': "asc"})
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    searchForBuildsByWeapon: async (root, args) => {
      const buildsPerPage = 20
      const currentPage = args.page ? args.page - 1 : 0
      const searchCriteria = { weapon: args.weapon }
      const buildCount = await Build
        .countDocuments(searchCriteria)
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      const pageCount = Math.ceil(buildCount / buildsPerPage)
      if (args.page > pageCount) throw new UserInputError('too big page number given', {
        invalidArgs: args,
      })

      const builds = await Build
        .find(searchCriteria)
        .skip(buildsPerPage * currentPage)
        .limit(buildsPerPage)
        .sort({'top': 'desc', 'updatedAt': 'desc'})
        .populate('discord_user')
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      return { builds, pageCount }
    }
  },
  Mutation: {
    addBuild: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError('User not logged in.')
      if (args.title) if (args.title.length > 100) throw new UserInputError('Title too long.', {
        invalidArgs: args,
      })
      if (!weapons.includes(args.weapon)) throw new UserInputError('Invalid weapon.', {
        invalidArgs: args,
      })

      const existingBuilds = await Build
        .find({ discord_id: ctx.user.discord_id})
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
      if (existingBuilds.length >= 100) throw new UserInputError('Can\'t have more than 100 builds per user.', {
        invalidArgs: args,
      })

      const build = new Build({ ...args, discord_id: ctx.user.discord_id })
      return build.save()
        .catch(e => {
          throw new UserInputError, {
            invalidArgs: args,
          }
        })
    },
    deleteBuild: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError('not authenticated')

      const build = await Build.findOne({ _id: args.id})

      if (!build) throw new UserInputError('no build found with the id', {
        invalidArgs: args,
      })
      if (ctx.user.discord_id !== build.discord_id) throw new AuthenticationError('no privileges')

      try {
        await Build.findByIdAndDelete({ _id: args.id })
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return true
    },
    updateBuild: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError('not authenticated')

      const build = await Build.findOne({ _id: args.id})
      if (!build) throw new UserInputError('no build found with the id', {
        invalidArgs: args,
      })

      if (ctx.user.discord_id !== build.discord_id) throw new AuthenticationError('no privileges to edit the build')

      await Build.findByIdAndUpdate(build._id, { ...args, top: null })
        .catch(e => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })

      return true
    }
  },
  Build: {
    top: async (root) => {
      if (typeof root.top === 'boolean') return root.top
      const user = await User
        .findOne({ discord_id: root.discord_id })
        .catch(e => {
          throw new UserInputError, {
            invalidArgs: args,
          }
        })

      if (!user) throw new UserInputError

      if (!user.twitter_name) {
        await Build.findByIdAndUpdate(root._id, { top: false })
        return false
      }

      const player = await Player
        .findOne({ twitter: user.twitter_name })
        .catch(e => {
          throw new UserInputError, {
            invalidArgs: args,
          }
        })

      if (!player) { //twitter not set or played not in top 500
        await Build.findByIdAndUpdate(root._id, { top: false })
        return false
      }

      if (player.weapons.indexOf(root.weapon) >= 0) { //if player has reached top 500 with the weapon
        await Build.findByIdAndUpdate(root._id, { top: true })
        return true
      }

      await Build.findByIdAndUpdate(root._id, { top: false })
      return false
    }
  }
}

module.exports = {
  Build: typeDef,
  buildResolvers: resolvers
}