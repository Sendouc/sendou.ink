const { UserInputError, gql } = require("apollo-server-express")
const Tournament = require("../mongoose-models/tournament")
const Round = require("../mongoose-models/round")

const typeDef = gql`
  extend type Query {}

  extend type Mutation {
    addTournament(
      tournament: DetailedTournamentInput!
      rounds: [DetailedRoundInput!]!
      lanistaToken: String!
    ): Boolean!
  }

  # all team datas here to display results? -> ask lean for Tournament format -> maybe top 3?

  input DetailedTournamentInput {
    name: String!
    bracket: String!
    date: String!
    winning_team_name: String!
    winning_team_discord_ids: [String]
  }

  input DetailedRoundInput {
    round_number: Int!
    game_number: Int!
    stage: String!
    mode: Mode!
    winners: TeamRoundInfo!
    losers: TeamRoundInfo!
  }

  type DetailedTournament {}

  type DetailedRound {
    tournament_id: DetailedTournament!
    round_number: Int!
    game_number: Int!
    stage: String!
    mode: Mode!
    winners: TeamRoundInfo!
    losers: TeamRoundInfo!
  }

  # DC BOOl? name needed?
  type TeamRoundInfo {
    team_name: String!
    names: [String!]!
    discord_ids: [String!]!
    weapons: [String!]!
    main_abilities: [[Ability]!]!
    sub_abilities: [[Ability]!]!
    kills: [[Int]!]!
    deaths: [[Int]!]!
    specials: [[Int]!]!
    paint: [[Int]!]!
    gear: [[String]!]!
    "Duration of the round in seconds"
    duration: Int!
    "Score between 0 and 100 (KO)"
    score: Int!
  }
`

const resolvers = {
  Query: {},
}

module.exports = {
  DetailedTournament: typeDef,
  detailedTournamentResolvers: resolvers,
}
