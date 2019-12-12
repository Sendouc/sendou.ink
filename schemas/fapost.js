const { UserInputError, gql } = require("apollo-server-express")
const FAPost = require("../models/fapost")

const canVCValues = ["YES", "USUALLY", "SOMETIMES", "NO"]
const playstyleValues = ["FRONTLINE", "MIDLINE", "BACKLINE"]

const typeDef = gql`
  extend type Query {
    freeAgentPosts: [FAPost!]!
  }

  extend type Mutation {
    addFreeAgentPost(
      can_vc: CanVC!
      playstyles: [Playstyle!]
      activity: String
      looking_for: String
      past_experience: String
      description: String
    ): Boolean!
    hideFreeAgentPost: Boolean!
    updateFreeAgentPost(
      can_vc: CanVC!
      playstyles: [Playstyle!]
      activity: String
      looking_for: String
      past_experience: String
      description: String
    ): Boolean!
  }

  enum CanVC {
    YES
    USUALLY
    SOMETIMES
    NO
  }

  enum Playstyle {
    FRONTLINE
    MIDLINE
    BACKLINE
  }

  "Represents a free agent post of a player looking for a team"
  type FAPost {
    id: ID!
    discord_id: String!
    can_vc: CanVC!
    playstyles: [Playstyle!]
    "How active is the free agent"
    activity: String
    "What kind of team they are looking for"
    looking_for: String
    "Teams or other past experience in competitive"
    past_experience: String
    "Free word about anything else"
    description: String
    discord_user: User!
    hidden: Boolean!
    createdAt: String!
  }
`

const validateFAPost = args => {
  if (canVCValues.indexOf(args.can_vc) === -1) {
    throw new UserInputError("Invalid 'can vc' value provided.")
  }

  const playstyles = args.playstyles ? [...new Set(args.playstyles)] : []
  if (playstyles.some(playstyle => playstyleValues.indexOf(playstyle) === -1)) {
    throw new UserInputError("Invalid 'playstyles' value provided.")
  }

  if (args.activity && args.activity.length > 100) {
    throw new UserInputError("'activity' value too long.")
  }

  if (args.looking_for && args.looking_for.length > 100) {
    throw new UserInputError("'looking_for' value too long.")
  }

  if (args.past_experience && args.past_experience.length > 100) {
    throw new UserInputError("'past_experience' value too long.")
  }

  if (args.past_experience && args.past_experience.length > 100) {
    throw new UserInputError("'past_experience' value too long.")
  }

  if (args.description && args.description.length > 1000) {
    throw new UserInputError("'description' value too long.")
  }
}

const resolvers = {
  Query: {
    freeAgentPosts: (root, args) => {
      return FAPost.find({})
        .populate("discord_user")
        .sort({ createdAt: "desc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
  },
  Mutation: {
    addFreeAgentPost: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")

      validateFAPost(args)

      const existingFAPost = await FAPost.findOne({
        discord_user: ctx.user.discord_id,
      }).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })

      if (existingFAPost) {
        if (!existingFAPost.hidden)
          throw new UserInputError("Post already exists.")

        const weekFromCreatingFAPost =
          parseInt(existingFAPost.createdAt) + 604800000
        if (existingFAPost.hidden) {
          if (weekFromCreatingFAPost > Date.now()) {
            throw new UserInputError(
              "Week hasn't passed from the last free agent post."
            )
          } else {
            await FAPost.findByIdAndRemove(existingFAPost._id).catch(e => {
              throw new UserInputError(e.message, {
                invalidArgs: args,
              })
            })
          }
        }
      }

      const faPost = new FAPost({ ...args, discord_id: ctx.user.discord_id })
      await faPost.save().catch(e => {
        throw (new UserInputError(),
        {
          invalidArgs: args,
        })
      })

      return true
    },
    updateFreeAgentPost: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")

      validateFAPost(args)

      await FAPost.findOneAndUpdate(
        { discord_id: ctx.user.discord_id },
        { ...args }
      ).catch(e => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })

      return true
    },
    hideFreeAgentPost: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")

      const post = await FAPost.findOne({
        discord_id: ctx.user.discord_id,
      }).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })

      if (!post) throw new UserInputError("User has no posts.")
      if (post.hidden) throw new UserInputError("Post already hidden.")

      await FAPost.findByIdAndUpdate(post._id, { hidden: true }).catch(e => {
        throw (new UserInputError(),
        {
          invalidArgs: args,
        })
      })

      return true
    },
  },
}

module.exports = {
  FAPost: typeDef,
  faPostResolvers: resolvers,
}
