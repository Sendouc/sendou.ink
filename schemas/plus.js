const { UserInputError, gql } = require("apollo-server-express")
const Ballot = require("../models/ballot")
const Suggested = require("../models/suggested")
const Summary = require("../models/summary")
const VotedPerson = require("../models/votedperson")

const typeDef = gql`
  type Suggested {
    discord_id: String!
    suggester_discord_id: String!
    plus_region: PlusRegion!
    plus_server: PlusServer!
    description: String!
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

const resolvers = {}

module.exports = {
  Plus: typeDef,
  plusResolvers: resolvers,
}
