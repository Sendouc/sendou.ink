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
    "Returns builds by given weapon. If weapon is omitted returns latest builds instead."
    searchForBuildsByWeapon(weapon: String, page: Int): BuildCollection!
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
const resolvers = {
  Query: {
    searchForBuilds: (root, args) => {
      if (!args.discord_id && !args.weapon)
        throw new UserInputError(
          "Discord ID or weapon has to be in the arguments"
        )
      return Build.find({ ...args })
        .sort({ top: "desc", updatedAt: "desc" })
        .populate("discord_user")
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    searchForBuildsByWeapon: async (root, args) => {
      const buildsPerPage = 18
      const currentPage = args.page ? args.page - 1 : 0
      const searchCriteria = !args.weapon ? {} : { weapon: args.weapon }
      const buildCount = await Build.countDocuments(searchCriteria).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
      const pageCount = Math.ceil(buildCount / buildsPerPage)
      // if 0 documents we don't care if the page is wrong
      if (buildCount !== 0) {
        if (args.page > pageCount)
          throw new UserInputError("too big page number given", {
            invalidArgs: args,
          })
      }

      const builds = await Build.find(searchCriteria)
        .skip(buildsPerPage * currentPage)
        .limit(buildsPerPage)
        .sort({ top: !args.weapon ? null : "desc", updatedAt: "desc" })
        .populate("discord_user")
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      return { builds, pageCount }
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

      const items = gear.flatMap(brand => {
        const headItems = brand.head ? brand.head : []
        const clothesItems = brand.clothes ? brand.clothes : []
        const shoesItems = brand.shoes ? brand.shoes : []
        return headItems.concat(clothesItems).concat(shoesItems)
      })
      if (args.headgearItem) {
        if (!items.includes(args.headgearItem))
          throw new UserInputError("Invalid headgear item.", {
            invalidArgs: args,
          })
      } else {
        args.headgearItem = undefined
      }
      if (args.clothingItem) {
        if (!items.includes(args.clothingItem))
          throw new UserInputError("Invalid clothing item.", {
            invalidArgs: args,
          })
      } else {
        args.clothingItem = undefined
      }
      if (args.shoesItem) {
        if (!items.includes(args.shoesItem))
          throw new UserInputError("Invalid shoes item.", {
            invalidArgs: args,
          })
      } else {
        args.shoesItem = undefined
      }

      const existingBuilds = await Build.find({
        discord_id: ctx.user.discord_id,
      }).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
      if (existingBuilds.length >= 100)
        throw new UserInputError("Can't have more than 100 builds per user.", {
          invalidArgs: args,
        })

      const build = new Build({ ...args, discord_id: ctx.user.discord_id })
      return build.save().catch(e => {
        throw (new UserInputError(),
        {
          invalidArgs: args,
        })
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

      const items = gear.flatMap(brand => {
        const headItems = brand.head ? brand.head : []
        const clothesItems = brand.clothes ? brand.clothes : []
        const shoesItems = brand.shoes ? brand.shoes : []
        return headItems.concat(clothesItems).concat(shoesItems)
      })
      if (args.headgearItem) {
        if (!items.includes(args.headgearItem))
          throw new UserInputError("Invalid headgear item.", {
            invalidArgs: args,
          })
      }
      if (args.clothingItem) {
        if (!items.includes(args.clothingItem))
          throw new UserInputError("Invalid clothing item.", {
            invalidArgs: args,
          })
      }
      if (args.shoesItem) {
        if (!items.includes(args.shoesItem))
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
      }).catch(e => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })

      return true
    },
  },
  Build: {
    top: async root => {
      if (typeof root.top === "boolean") return root.top
      const user = await User.findOne({ discord_id: root.discord_id }).catch(
        e => {
          throw (new UserInputError(),
          {
            invalidArgs: args,
          })
        }
      )

      if (!user) throw new UserInputError()

      if (!user.twitter_name) {
        await Build.findByIdAndUpdate(root._id, { top: false })
        return false
      }

      const player = await Player.findOne({ twitter: user.twitter_name }).catch(
        e => {
          throw (new UserInputError(),
          {
            invalidArgs: args,
          })
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
