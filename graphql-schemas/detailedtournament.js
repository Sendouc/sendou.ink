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
  extend type Query {
    plusDraftCups: DraftCupCollection!
    searchForDraftCup(name: String!): DraftCupDetailCollection!
  }

  extend type Mutation {
    addDetailedTournament(
      plus_server: PlusServer!
      tournament: DetailedTournamentInput!
      matches: [DetailedMatchInput!]!
      lanistaToken: String!
    ): Boolean!
  }

  type DraftCupCollection {
    leaderboards: [Leaderboard!]!
    tournaments: [DetailedTournament!]!
  }

  type DraftCupDetailCollection {
    tournament: DetailedTournament!
    matches: [DetailedMatch!]!
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
    top_3_discord_users: [[User!]!]!
    participant_discord_ids: [String!]!
    type: EventType!
  }

  input DetailedMatchInput {
    round_name: String!
    round_number: Int!
    map_details: [DetailedMapInput!]!
  }

  type DetailedMatch {
    tournament_id: DetailedTournament!
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
    discord_user: User!
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
    discord_user: User!
    "Number of first places"
    first: Int!
    "Number of second places"
    second: Int!
    "Number of third places"
    third: Int!
    score: Int!
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

async function updateLeaderboard(top_3_discord_ids, type) {
  let leaderboard = await Leaderboard.findOne({ type })

  if (!leaderboard) leaderboard = { players: [] }

  const newPlayers = []

  top_3_discord_ids.forEach((team, index) => {
    const placement = ["first", "second", "third"][index]
    team.forEach(discord_id => {
      const foundPlayer = leaderboard.players.find(
        player => discord_id === player.discord_id
      )
      if (foundPlayer) {
        foundPlayer[placement] = foundPlayer[placement] + 1
      } else {
        const newPlayer = { discord_id, first: 0, second: 0, third: 0 }
        newPlayer[placement] = newPlayer[placement] + 1
        newPlayers.push(newPlayer)
      }
    })
  })

  const newLeaderboard = {
    players: [...leaderboard.players, ...newPlayers],
    type,
  }
  newLeaderboard.players.sort(
    (a, b) =>
      b.first * 4 +
      b.second * 2 +
      b.third -
      (a.first * 4 + a.second * 2 + a.third)
  )

  await Leaderboard.findOneAndUpdate({ type }, newLeaderboard, { upsert: true })
}

async function generateStats(type) {
  const matches = await DetailedMatch.find({})
  const stats = {}
  matches.forEach(match => {
    match.map_details.forEach(map_detail => {
      const { duration, winners, losers } = map_detail
      ;[winners, losers].forEach((teamInfo, index) => {
        teamInfo.players.forEach(player => {
          const {
            discord_id,
            weapon,
            kills,
            assists,
            deaths,
            specials,
            paint,
          } = player
          if (!stats[discord_id]) {
            stats[discord_id] = {}
          }
          ;[weapon, "ALL"].forEach(weaponOrAll => {
            const weaponStats = stats[discord_id][weaponOrAll]
              ? stats[discord_id][weaponOrAll]
              : {
                  discord_id,
                  weapon: weaponOrAll,
                  kills: 0,
                  assists: 0,
                  deaths: 0,
                  specials: 0,
                  paint: 0,
                  seconds_played: 0,
                  games_played: 0,
                  wins: 0,
                  type,
                }
            weaponStats.kills = weaponStats.kills + kills
            weaponStats.assists = weaponStats.assists + assists
            weaponStats.deaths = weaponStats.deaths + deaths
            weaponStats.specials = weaponStats.specials + specials
            weaponStats.paint = weaponStats.paint + paint
            weaponStats.seconds_played = weaponStats.seconds_played + duration
            weaponStats.games_played = weaponStats.games_played + 1
            weaponStats.wins = weaponStats.wins + (index === 0 ? 1 : 0)

            stats[discord_id][weaponOrAll] = weaponStats
          })
        })
      })
    })
  })

  const statsForDb = []
  Object.keys(stats).forEach(discord_id => {
    Object.keys(stats[discord_id]).forEach(weapon => {
      statsForDb.push(stats[discord_id][weapon])
    })
  })

  PlayerStat.deleteMany({ type })
  await PlayerStat.insertMany(statsForDb)
}

const resolvers = {
  TournamentPlayer: {
    score: root => {
      return root.first * 4 + root.second * 2 + root.third
    },
  },
  Query: {
    plusDraftCups: async (root, args) => {
      const leaderboards = await Leaderboard.find()
        .or([{ type: "DRAFTONE" }, { type: "DRAFTTWO" }])
        .populate("players.discord_user")
      const tournaments = await DetailedTournament.find()
        .or([{ type: "DRAFTONE" }, { type: "DRAFTTWO" }])
        .populate("top_3_discord_users")

      return { leaderboards, tournaments }
    },
    searchForDraftCup: async (root, args) => {
      // \ to escape + in the name
      const tournament = await DetailedTournament.findOne({
        name: { $regex: "\\" + args.name, $options: "i" },
      }).populate("top_3_discord_users")

      if (!tournament) return []

      const matches = await DetailedMatch.find({
        tournament_id: tournament._id,
      })
        .sort({
          round_number: "asc",
          game_number: "asc",
        })
        .populate("map_details.winners.players.discord_user")
        .populate("map_details.losers.players.discord_user")

      return { tournament, matches }
    },
  },
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

      const eventType = args.plus_server === "TWO" ? "DRAFTTWO" : "DRAFTONE"
      if (problems.length > 0) {
        throw new UserInputError(problems.join(","))
      }
      const tournament = args.tournament
      tournament.type = eventType

      const savedTournament = await DetailedTournament.create(tournament)

      args.matches.forEach(match => {
        match.tournament_id = savedTournament._id
        match.type = eventType
      })

      await DetailedMatch.insertMany(args.matches)

      await updateLeaderboard(args.tournament.top_3_discord_ids, eventType)
      await generateStats(eventType)
      return true
    },
  },
}

module.exports = {
  DetailedTournament: typeDef,
  detailedTournamentResolvers: resolvers,
}
