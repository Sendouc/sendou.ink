const {
  UserInputError,
  AuthenticationError,
  gql,
} = require("apollo-server-express")
const Build = require("../mongoose-models/build")
const User = require("../mongoose-models/user")
const Player = require("../mongoose-models/player")
const weapons = require("../utils/weapons")
const gear = require("../utils/gear")

const typeDef = gql`
  extend type Query {
    searchForBuilds(discord_id: String, weapon: String): [Build!]!
  }
  extend type Mutation {
    addBuild(
      weapon: String!
      title: String
      description: String
      headgear: [Ability!]!
      headgearItem: String
      clothing: [Ability!]!
      clothingItem: String
      shoes: [Ability!]!
      shoesItem: String
    ): Build
    deleteBuild(id: ID!): Boolean
    updateBuild(
      id: ID!
      weapon: String!
      title: String
      description: String
      headgear: [Ability!]!
      headgearItem: String
      clothing: [Ability!]!
      clothingItem: String
      shoes: [Ability!]!
      shoesItem: String
    ): Boolean
  }
  type Build {
    id: ID!
    discord_id: String!
    weapon: String!
    title: String
    description: String
    headgear: [Ability!]!
    headgearItem: String
    clothing: [Ability!]!
    clothingItem: String
    shoes: [Ability!]!
    shoesItem: String
    updatedAt: String!
    top: Boolean!
    discord_user: User!
    jpn: Boolean
  }
  type BuildCollection {
    builds: [Build!]!
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
    AD
  }
`
const altMap = new Map([
  ["Splattershot", "Hero Shot Replica"],
  ["Tentatek Splattershot", "Octo Shot Replica"],
  ["Blaster", "Hero Blaster Replica"],
  ["Splat Roller", "Hero Roller Replica"],
  ["Octobrush", "Herobrush Replica"],
  ["Splat Charger", "Hero Charger Replica"],
  ["Slosher", "Hero Slosher Replica"],
  ["Heavy Splatling", "Hero Splatling Replica"],
  ["Splat Dualies", "Hero Dualie Replicas"],
  ["Splat Brella", "Hero Brella Replica"],
])

const getBuildSearchCriteria = (args) => {
  if (altMap.has(args.weapon))
    return {
      weapon: { $in: [args.weapon, altMap.get(args.weapon)] },
    }

  return { ...args }
}

const resolvers = {
  Query: {
    searchForBuilds: (root, args) => {
      if (!args.discord_id && !args.weapon)
        throw new UserInputError(
          "Discord ID or weapon has to be in the arguments"
        )

      return Build.find(getBuildSearchCriteria(args))
        .sort({ top: "desc", jpn: "desc", updatedAt: "desc" })
        .populate("discord_user")
        .catch((e) => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
  },
  Mutation: {
    addBuild: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (args.title) {
        if (args.title.length > 100)
          throw new UserInputError("Title too long.", {
            invalidArgs: args,
          })
      } else {
        args.title = undefined
      }

      if (args.description) {
        if (args.description.length > 1000)
          throw new UserInputError("Description too long.", {
            invalidArgs: args,
          })
      } else {
        args.description = undefined
      }
      if (!weapons.includes(args.weapon))
        throw new UserInputError("Invalid weapon.", {
          invalidArgs: args,
        })

      if (args.headgearItem) {
        if (!gear.includes(args.headgearItem))
          throw new UserInputError("Invalid headgear item.", {
            invalidArgs: args,
          })
      } else {
        args.headgearItem = undefined
      }
      if (args.clothingItem) {
        if (!gear.includes(args.clothingItem))
          throw new UserInputError("Invalid clothing item.", {
            invalidArgs: args,
          })
      } else {
        args.clothingItem = undefined
      }
      if (args.shoesItem) {
        if (!gear.includes(args.shoesItem))
          throw new UserInputError("Invalid shoes item.", {
            invalidArgs: args,
          })
      } else {
        args.shoesItem = undefined
      }

      const existingBuilds = await Build.find({
        discord_id: ctx.user.discord_id,
      }).catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
      if (
        existingBuilds.length >= 100 &&
        ctx.user.discord_id !== process.env.GANBA_ID
      )
        throw new UserInputError("Can't have more than 100 builds per user.", {
          invalidArgs: args,
        })

      const build = new Build({
        ...args,
        discord_id: ctx.user.discord_id,
        jpn: ctx.user.discord_id === process.env.GANBA_ID,
      })
      return build.save().catch((e) => {
        throw (
          (new UserInputError(),
          {
            invalidArgs: args,
          })
        )
      })
    },
    deleteBuild: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")

      const build = await Build.findOne({ _id: args.id })

      if (!build)
        throw new UserInputError("no build found with the id", {
          invalidArgs: args,
        })
      if (ctx.user.discord_id !== build.discord_id)
        throw new AuthenticationError("no privileges")

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
      if (!ctx.user) throw new AuthenticationError("not authenticated")
      if (args.title)
        if (args.title.length > 100)
          throw new UserInputError("Title too long.", {
            invalidArgs: args,
          })
      if (args.description) {
        if (args.description.length > 1000)
          throw new UserInputError("Description too long.", {
            invalidArgs: args,
          })
      }
      if (!weapons.includes(args.weapon))
        throw new UserInputError("Invalid weapon.", {
          invalidArgs: args,
        })

      if (args.headgearItem) {
        if (!gear.includes(args.headgearItem))
          throw new UserInputError("Invalid headgear item.", {
            invalidArgs: args,
          })
      }
      if (args.clothingItem) {
        if (!gear.includes(args.clothingItem))
          throw new UserInputError("Invalid clothing item.", {
            invalidArgs: args,
          })
      }
      if (args.shoesItem) {
        if (!gear.includes(args.shoesItem))
          throw new UserInputError("Invalid shoes item.", {
            invalidArgs: args,
          })
      }

      const build = await Build.findOne({ _id: args.id })
      if (!build)
        throw new UserInputError("no build found with the id", {
          invalidArgs: args,
        })

      if (ctx.user.discord_id !== build.discord_id)
        throw new AuthenticationError("no privileges to edit the build")

      await Build.findByIdAndUpdate(build._id, {
        ...args,
        top: build.top ? build.top : null,
      }).catch((e) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })

      return true
    },
  },
  Build: {
    top: async (root) => {
      if (typeof root.top === "boolean") return root.top
      const user = await User.findOne({ discord_id: root.discord_id }).catch(
        (e) => {
          throw (
            (new UserInputError(),
            {
              invalidArgs: args,
            })
          )
        }
      )

      if (!user) throw new UserInputError()

      if (!user.twitter_name) {
        await Build.findByIdAndUpdate(root._id, { top: false })
        return false
      }

      const player = await Player.findOne({ twitter: user.twitter_name }).catch(
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
        //twitter not set or played not in top 500
        await Build.findByIdAndUpdate(root._id, { top: false })
        return false
      }

      if (player.weapons.indexOf(root.weapon) >= 0) {
        //if player has reached top 500 with the weapon
        await Build.findByIdAndUpdate(root._id, { top: true })
        return true
      }

      await Build.findByIdAndUpdate(root._id, { top: false })
      return false
    },
  },
}

module.exports = {
  Build: typeDef,
  buildResolvers: resolvers,
}
