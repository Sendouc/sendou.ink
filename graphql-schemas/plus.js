const { UserInputError, gql } = require("apollo-server-express")
const User = require("../mongoose-models/user")
const Ballot = require("../mongoose-models/ballot")
const Suggested = require("../mongoose-models/suggested")
const Summary = require("../mongoose-models/summary")
const VotedPerson = require("../mongoose-models/votedperson")

const typeDef = gql`
  extend type Query {
    hasAccess(discord_id: String!, server: String!): Boolean!
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
    plus_two_invite_link: String
    voting_ends: String
    plus_one_members: [User!]!
    plus_two_members: [User!]!
  }

  type Suggested {
    discord_id: String!
    suggester_discord_id: String!
    plus_region: PlusRegion!
    plus_server: PlusServer!
    description: String!
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

  type VotedPerson {
    discord_id: String!
    voter_discord_id: String!
    month: Int!
    year: Int!
    "Voting result -2 to +2 (-1 to +1 cross-region)"
    score: Float!
  }

  type Ballot {
    discord_id: String!
    plus_server: PlusServer!
    month: Int!
    year: Int!
    votes: [VotedPerson!]!
  }

  "Voting result of a player"
  type Summary {
    discord_id: String!
    suggester_discord_id: String
    voucher_discord_id: String
    plus_server: PlusServer!
    month: Int!
    year: Int!
    "Average of all scores of the voters for the month -100% to 100%"
    score: Float!
  }
`

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
  },
}

module.exports = {
  Plus: typeDef,
  plusResolvers: resolvers,
}
