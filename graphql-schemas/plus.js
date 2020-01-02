const {
  UserInputError,
  AuthenticationError,
  gql,
} = require("apollo-server-express")
const shuffle = require("../utils/shuffleArray")
const User = require("../mongoose-models/user")
const Suggested = require("../mongoose-models/suggested")
const Summary = require("../mongoose-models/summary")
const VotedPerson = require("../mongoose-models/votedperson")
const State = require("../mongoose-models/state")

const typeDef = gql`
  extend type Query {
    plusInfo: PlusGeneralInfo
    hasAccess(discord_id: String!, server: String!): Boolean!
    suggestions: [Suggested!]!
    usersForVoting: UsersForVoting!
  }

  extend type Mutation {
    addSuggestion(
      discord_id: String!
      server: String!
      region: String!
      description: String!
    ): Boolean!
    addVotes(votes: [VoteInput!]!): Boolean!
    startVoting(ends: String!): Boolean!
  }

  "+1 or +2 LFG server on Discord"
  enum PlusServer {
    ONE
    TWO
  }

  "Region used for voting"
  enum PlusRegion {
    EU
    NA
  }

  type PlusGeneralInfo {
    plus_one_invite_link: String
    plus_two_invite_link: String!
    voting_ends: String
  }

  type Suggested {
    discord_id: String!
    discord_user: User!
    suggester_discord_id: String!
    suggester_discord_user: User!
    plus_region: PlusRegion!
    plus_server: PlusServer!
    description: String!
    createdAt: String!
  }

  "Status with +1 and +2 related things"
  type PlusStatus {
    membership_status: PlusServer
    vouch_status: PlusServer
    plus_region: PlusRegion
    can_vouch: Boolean
    last_vouched: String
  }

  extend type User {
    plus: PlusStatus
  }

  input VoteInput {
    discord_id: String!
    score: Int!
  }

  type VotedPerson {
    discord_id: String!
    voter_discord_id: String!
    plus_server: String!
    month: Int!
    year: Int!
    "Voting result -2 to +2 (-1 to +1 cross-region)"
    score: Int!
  }

  "Voting result of a player"
  type Summary {
    discord_id: String!
    suggester_discord_id: String
    voucher_discord_id: String
    plus_server: PlusServer!
    month: Int!
    year: Int!
    "Average of all scores of the voters for the month 0% to 100%"
    score: Float!
    new: Boolean!
  }

  type UsersForVoting {
    users: [User!]!
    suggested: [Suggested!]!
    votes: [VotedPerson!]!
  }
`

const validateVotes = (votes, users, suggested, user) => {
  const region = user.plus.plus_region

  votes.forEach(vote => {
    const { discord_id, score } = vote

    let user = users.find(user => user.discord_id === discord_id)

    if (!user) {
      user = suggested.find(
        suggested => suggested.discord_user.discord_id === discord_id
      )
      if (!user)
        throw new UserInputError(
          `Invalid user voted on with the id ${discord_id}`
        )
      user = user.discord_user
    }

    if (score !== -2 && score !== -1 && score !== 1 && score !== 2)
      throw new Error(`Invalid score provided: ${score}`)

    if ((score === -2 || score === 2) && region !== user.plus.plus_region)
      throw new Error("Score of -2 or 2 given cross region")
  })
}

const resolvers = {
  Query: {
    hasAccess: async (root, args) => {
      const user = await User.findOne({ discord_id: args.discord_id }).catch(
        e => {
          throw (new Error(),
          {
            invalidArgs: args,
          })
        }
      )

      if (!user || !user.plus) return false

      const { membership_status, vouch_status } = user.plus
      let membership_code =
        membership_status === "TWO" || vouch_status === "TWO" ? "TWO" : null
      membership_code =
        membership_status === "ONE" || vouch_status === "ONE"
          ? "ONE"
          : membership_code

      if (membership_code === "ONE") return true
      if (membership_code === "TWO" && args.server === "TWO") return true

      return false
    },
    plusInfo: async (root, args, ctx) => {
      if (!ctx.user) return null
      if (
        !ctx.user.plus ||
        (!ctx.user.plus.membership_status && !ctx.user.plus.vouch_status)
      ) {
        return null
      }

      const plus_server =
        ctx.user.plus.membership_status === "ONE" ||
        ctx.user.plus.vouch_status === "ONE"
          ? "ONE"
          : "TWO"

      const state = await State.findOne({})

      return {
        plus_one_invite_link:
          plus_server === "ONE" ? process.env.PLUS_ONE_LINK : null,
        plus_two_invite_link: process.env.PLUS_TWO_LINK,
        voting_ends: state.voting_ends,
      }
    },
    usersForVoting: async (root, args, ctx) => {
      if (!ctx.user) throw new UserInputError("Not logged in")
      if (!ctx.user.plus || !ctx.user.plus.membership_status)
        throw new UserInputError("Not plus server member")
      const plus_server = ctx.user.plus.membership_status

      const users = await User.find({
        $or: [
          {
            "plus.membership_status": plus_server,
          },

          { "plus.vouch_status": plus_server },
        ],
      }).catch(e => {
        throw (new Error(),
        {
          error: e,
        })
      })

      const suggested = await Suggested.find({ plus_server })
        .populate("discord_user")
        .populate("suggester_discord_user")
        .catch(e => {
          throw (new Error(),
          {
            error: e,
          })
        })

      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const votes = await VotedPerson.find({
        plus_server,
        month,
        year,
        voter_discord_id: ctx.user.discord_id,
      })

      shuffle(users)
      shuffle(suggested)

      return { users, suggested, votes }
    },
    suggestions: (root, args, ctx) => {
      if (!ctx.user || !ctx.user.plus) return null
      const searchCriteria =
        ctx.user.plus.membership_status === "ONE" ? {} : { plus_server: "TWO" }
      return Suggested.find(searchCriteria)
        .populate("discord_user")
        .populate("suggester_discord_user")
        .sort({ createdAt: "desc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
  },
  Mutation: {
    addSuggestion: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (
        !ctx.user.plus ||
        (!ctx.user.plus.membership_status && !ctx.user.plus.vouch_status)
      ) {
        throw new AuthenticationError("Not plus member.")
      }

      const user = await User.findOne({ discord_id: args.discord_id }).catch(
        e => {
          throw (new Error(),
          {
            invalidArgs: args,
            error: e,
          })
        }
      )

      const suggestion = await Suggested.findOne({
        suggester_discord_id: ctx.user.discord_id,
      }).catch(e => {
        throw (new Error(),
        {
          invalidArgs: args,
          error: e,
        })
      })

      if (suggestion) throw new UserInputError("Already suggested this month.")

      const duplicateSuggestion = await Suggested.findOne({
        discord_id: args.discord_id,
        plus_server: args.server,
      }).catch(e => {
        throw (new Error(),
        {
          invalidArgs: args,
          error: e,
        })
      })

      if (duplicateSuggestion)
        throw new UserInputError(
          "This user has already been suggested this month."
        )

      if (!user)
        throw new UserInputError("Suggested user not sendou.ink member.")

      if (args.server !== "ONE" && args.server !== "TWO")
        throw new UserInputError("Server arg has to be 'ONE' or 'TWO'.")

      if (user.plus.membership_status === args.server)
        throw new UserInputError(
          "Suggested user is already a member of the server."
        )

      if (ctx.user.plus.membership_status !== "ONE" && args.server === "ONE")
        throw new UserInputError("Can't suggest to +1 without being +1 member.")

      if (args.region !== "EU" && args.region !== "NA")
        throw new UserInputError("Region arg has to be 'NA' or 'EU'.")

      if (args.description.length > 1000)
        throw new UserInputError("Description has to be below 1000 characters.")

      const newSuggestion = new Suggested({
        discord_id: args.discord_id,
        suggester_discord_id: ctx.user.discord_id,
        plus_region: args.region,
        plus_server: args.server,
        description: args.description,
      })

      await newSuggestion.save().catch(e => {
        throw (new Error(),
        {
          invalidArgs: args,
        })
      })

      return true
    },
    addVotes: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (
        !ctx.user.plus ||
        (!ctx.user.plus.membership_status && !ctx.user.plus.vouch_status)
      ) {
        throw new AuthenticationError("Not plus member.")
      }

      const state = await State.findOne({})

      const date = new Date()
      if (!state.voting_ends || state.voting_ends < date.getTime())
        throw new Error("Voting now open right now")

      const votedUsers = {}

      args.votes.forEach(vote => {
        if (votedUsers[vote.discord_id])
          throw new UserInputVote(
            `Duplicate vote with the id ${vote.discord_id}`
          )
        votedUsers[vote.discord_id] = true
      })

      const plus_server = ctx.user.plus.membership_status

      const users = await User.find({
        $or: [
          {
            "plus.membership_status": plus_server,
          },

          { "plus.vouch_status": plus_server },
        ],
      })

      const suggested = await Suggested.find({ plus_server })
        .populate("discord_user")
        .populate("suggester_discord_user")

      if (users.length + suggested.length !== args.votes.length)
        throw new UserInputError("Invalid number of votes provided")

      validateVotes(args.votes, users, suggested, ctx.user)

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      await VotedPerson.deleteMany({
        voter_discord_id: ctx.user.discord_id,
        month,
        year,
        plus_server,
      })

      const toInsert = args.votes.map(vote => ({
        discord_id: vote.discord_id,
        voter_discord_id: ctx.user.discord_id,
        month,
        year,
        plus_server,
        score: vote.score,
      }))
      await VotedPerson.insertMany(toInsert)

      return true
    },
    startVoting: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (ctx.user.discord_id !== process.env.ADMIN_ID)
        throw new AuthenticationError("Not admin.")

      await State.findOneAndUpdate({}, { voting_ends: args.ends })

      return true
    },
  },
}

module.exports = {
  Plus: typeDef,
  plusResolvers: resolvers,
}
