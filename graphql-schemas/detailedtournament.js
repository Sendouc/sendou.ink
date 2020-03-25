const {
  AuthenticationError,
  UserInputError,
  gql,
} = require("apollo-server-express")
const DetailedTournament = require("../mongoose-models/detailedtournament")
const DetailedMatch = require("../mongoose-models/detailedmatch")
const {
  validateDetailedTournamentInput,
  validateDetailedMapInput,
} = require("../utils/validators")

const typeDef = gql`
  extend type Mutation {
    addDetailedTournament(
      plus_server: PlusServer!
      tournament: DetailedTournamentInput!
      matches: [DetailedMatchInput!]!
      lanistaToken: String!
    ): Boolean!
  }

  input DetailedTournamentInput {
    name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [String!]!
    top_3_discord_ids: [[String!]!]!
  }

  type DetailedTournament {
    name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [String!]!
    top_3_discord_ids: [[String!]!]!
    participants_discord_ids: [String!]!
    type: EventType!
  }

  input DetailedMatchInput {
    round_name: String!
    round_number: Int!
    map_details: [DetailedMapInput!]!
  }

  type DetailedMatch {
    round_name: String!
    round_number: Int!
    map_details: [DetailedMap!]!
    type: EventType!
  }

  input DetailedMapInput {
    stage: String!
    mode: Mode!
    duration: Int!
    winners: TeamInfoInput!
    losers: TeamInfoInput!
  }

  type DetailedMap {
    tournament_id: DetailedTournament!
    stage: String!
    mode: Mode!
    "Duration of the round in seconds"
    duration: Int!
    winners: TeamInfo!
    losers: TeamInfo!
  }

  input TeamInfoInput {
    team_name: String!
    players: [DetailedPlayerInput!]!
    score: Int!
  }

  type TeamInfo {
    team_name: String!
    players: [DetailedPlayer!]!
    "Score between 0 and 100 (KO)"
    score: Int!
  }

  input DetailedPlayerInput {
    discord_id: String!
    weapon: String!
    main_abilities: [Ability!]!
    sub_abilities: [Ability]!
    kills: Int!
    assists: Int!
    deaths: Int!
    specials: Int!
    paint: Int!
    gear: [String]!
  }

  type DetailedPlayer {
    discord_id: String!
    weapon: String!
    main_abilities: [Ability!]!
    sub_abilities: [Ability]!
    kills: Int!
    assists: Int!
    deaths: Int!
    specials: Int!
    paint: Int!
    gear: [String!]!
  }

  type DraftLeaderboard {
    players: [DraftPlayer!]!
    plus_server: PlusServer!
  }

  type DraftPlayer {
    discord_id: String!
    first: Int!
    second: Int!
    third: Int!
  }

  enum EventType {
    PLUSDRAFT
  }
`

const resolvers = {
  Mutation: {
    addDetailedTournament: async (root, args) => {
      if (args.lanistaToken !== process.env.LANISTA_TOKEN) {
        throw new AuthenticationError("Invalid token provided")
      }

      validateDetailedTournamentInput(args.tournament)
      args.matches.forEach(match =>
        match.map_details.forEach(map => validateDetailedMapInput(map))
      )

      //put tourney in db
      //put matches in db
      //update leaderboard
      // stats?
    },
  },
}

module.exports = {
  DetailedTournament: typeDef,
  detailedTournamentResolvers: resolvers,
}
