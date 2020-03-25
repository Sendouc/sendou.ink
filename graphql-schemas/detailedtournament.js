const { UserInputError, gql } = require("apollo-server-express")
const DetailedTournament = require("../mongoose-models/detailedtournament")
const DetailedMatch = require("../mongoose-models/detailedmatch")

const typeDef = gql`
  extend type Mutation {
    addDetailedTournament(
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
    match_details: [DetailedMapInput!]!
  }

  type DetailedMatch {
    round_name: String!
    round_number: Int!
    match_details: [DetailedMap!]!
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
      console.log("args", args)
    },
  },
}

module.exports = {
  DetailedTournament: typeDef,
  detailedTournamentResolvers: resolvers,
}

/*{"tournament": {"name": "Test Tournament #1", "bracket_url": "www.google.com", "date": "1585006225", "top_3_team_names": ["Team 1", "Team 2", "Team 3"] "top_3_discord_ids": [["123", "123", "123", "123"], ["123", "123", "123", "123"], ["123", "123", "123", "123"]]}, "sets": {"round_number": 1, "game_number: 1, stage: "The Reef", mode: "SZ", duration: 300, winners: {"team_name": "Cool Team", players: [{"discord_id": "123", "weapon": "Tentatek Splattershot", "main_abilities": ["ISM", "ISM", "ISM"], "sub_abilities": ["ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM"], "kills": 1, "assists": 1, "deaths": 1, "specials": 1, "paint": 1000, "gear": ["asd", "asd", "asd"]}], "score": 100}, losers: {"team_name": "Cool Team", players: [{"discord_id": "123", "weapon": "Tentatek Splattershot", "main_abilities": ["ISM", "ISM", "ISM"], "sub_abilities": ["ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM"], "kills": 1, "assists": 1, "deaths": 1, "specials": 1, "paint": 1000, "gear": ["asd", "asd", "asd"]}], "score": 100}}, "lanistaToken": "asd"}



//player
{"team_name": "Cool Team", players: [{"discord_id": "123", "weapon": "Tentatek Splattershot", "main_abilities": ["ISM", "ISM", "ISM"], "sub_abilities": ["ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM", "ISM"], "kills": 1, "assists": 1, "deaths": 1, "specials": 1, "paint": 1000, "gear": ["asd", "asd", "asd"]}], "score": 100}*/
