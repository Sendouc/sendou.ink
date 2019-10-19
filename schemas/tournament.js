const { UserInputError, gql } = require("apollo-server-express")
const Tournament = require("../models/tournament")
const Round = require("../models/round")

const typeDef = gql`
  extend type Query {
    searchForTournamentById(id: String!): Tournament
  }
  type Tournament {
    name: String!
    "True if the tournament was a Japanese one"
    jpn: Boolean!
    "Link to the Google Sheet containing ganbawoomy's data"
    google_sheet_url: String
    date: String!
    "Top 5 of the most played weapons in the rounds recorded"
    popular_weapons: [String!]!
    winning_team_name: String!
    winning_team_players: [String!]!
    winning_team_unique_ids: [String]
    rounds: [Round!]!
  }
  type Round {
    stage: String!
    "SZ/TC/RM/CB/TW"
    mode: Mode!
    "E.g. Quarter-Finals"
    round_name: String!
    "Order of the round. Smaller number means the round took place before."
    round_number: Int!
    "Order the match in the round. Smaller number means the match took place before."
    game_number: Int!
    winning_team_name: String!
    winning_team_players: [String!]!
    winning_team_unique_ids: [String!]
    winning_team_weapons: [String!]!
    winning_team_main_abilities: [[Ability!]]
    winning_team_sub_abilities: [[Ability!]]
    losing_team_name: String!
    losing_team_players: [String!]!
    losing_team_unique_ids: [String!]
    losing_team_weapons: [String!]!
    losing_team_main_abilities: [[Ability!]]
    losing_team_sub_abilities: [[Ability!]]
  }
  enum Mode {
    SZ
    TC
    RM
    CB
    TW
  }
`

const resolvers = {
  Query: {
    searchForTournamentById: async (root, args) => {
      const rounds = await Round.find({ tournament_id: args.id })
        .sort({ round_number: "asc", game_number: "asc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args
          })
        })

      const tournament = await Tournament.findById(args.id).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args
        })
      })

      tournament.rounds = rounds
      return tournament
    }
  }
}

module.exports = {
  Tournament: typeDef,
  tournamentResolvers: resolvers
}
