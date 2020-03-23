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

  input DetailedTournamentInput {
    name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [[String]!]!
    top_3_discord_ids: [[String]!]!
  }

  input DetailedSetInput {
    round_number: Int!
    game_number: Int!
    stage: String!
    mode: Mode!
    duration: Int!
    winners: TeamInfo!
    losers: TeamInfo!
  }

  type DetailedTournament {
    name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [[String]!]!
    top_3_discord_ids: [[String]!]!
  }

  type DetailedSet {
    tournament_id: DetailedTournament!
    round_number: Int!
    game_number: Int!
    stage: String!
    mode: Mode!
    "Duration of the round in seconds"
    duration: Int!
    winners: TeamInfo!
    losers: TeamInfo!
  }

  type TeamInfo {
    team_name: String!
    players: [DetailedPlayer!]!
    "Score between 0 and 100 (KO)"
    score: Int!
  }

  type DetailedPlayer {
    discord_id: String!
    weapon: String!
    main_abilities: [Ability]!
    sub_abilities: [Ability]!
    kills: Int!
    assists: Int!
    deaths: Int!
    specials: Int!
    paint: Int!
    gear: [String]!
  }

  type DraftLeaderboard {
    players: [DraftPlayer!]!
  }

  type DraftPlayer {
    discord_id: String!
    first: Int!
    second: Int!
    third: Int!
  }
`

const resolvers = {
  Query: {},
}

module.exports = {
  DetailedTournament: typeDef,
  detailedTournamentResolvers: resolvers,
}
