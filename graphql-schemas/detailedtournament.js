const {
  AuthenticationError,
  UserInputError,
  gql,
} = require("apollo-server-express")
const DetailedTournament = require("../mongoose-models/detailedtournament")
const DetailedMatch = require("../mongoose-models/detailedmatch")
const Leaderboard = require("../mongoose-models/leaderboard")
const PlayerStat = require("../mongoose-models/playerstat")
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
    participant_discord_ids: [String!]!
  }

  type DetailedTournament {
    name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [String!]!
    top_3_discord_ids: [[String!]!]!
    participant_discord_ids: [String!]!
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
    sub_abilities: [[Ability]!]!
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
    sub_abilities: [[Ability]!]!
    kills: Int!
    assists: Int!
    deaths: Int!
    specials: Int!
    paint: Int!
    gear: [String!]!
  }

  type Leaderboard {
    players: [TournamentPlayer!]!
    type: EventType!
  }

  type TournamentPlayer {
    discord_id: String!
    "Number of first places"
    first: Int!
    "Number of second places"
    second: Int!
    "Number of third places"
    third: Int!
  }

  type PlayerStat {
    discord_id: String!
    "Weapon of the stat. ALL if stat is all weapon stats summed up"
    weapon: String!
    kills: Int!
    assists: Int!
    deaths: Int!
    specials: Int!
    paint: Int!
    seconds_played: Int!
    games_played: Int!
    wins: Int!
    type: EventType!
  }

  enum EventType {
    DRAFTONE
    DRAFTTWO
  }
`

const resolvers = {
  Mutation: {
    addDetailedTournament: async (root, args) => {
      if (args.lanistaToken !== process.env.LANISTA_TOKEN) {
        throw new AuthenticationError("Invalid token provided")
      }

      const tournamentInputProblems = await validateDetailedTournamentInput(
        args.tournament
      )
      const maptInputProblems = args.matches.map(match =>
        match.map_details.map(map => validateDetailedMapInput(map))
      )

      const problems = [
        ...tournamentInputProblems,
        ...maptInputProblems.flat(3),
      ]

      /*if (problems.length > 0) {
        throw new UserInputError(problems.join(","))
      }*/

      const eventType = args.plus_server === "TWO" ? "DRAFTTWO" : "DRAFTONE"

      /*type DetailedTournament {
    name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [String!]!
    top_3_discord_ids: [[String!]!]!
    participant_discord_ids: [String!]!
    type: EventType!
  }*/
      const tournament = args.tournament
      tournament.type = eventType

      //const savedTournament = await DetailedTournament.create(tournament)

      console.log("savedTournament", savedTournament._id)

      return true

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
