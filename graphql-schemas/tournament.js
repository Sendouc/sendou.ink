const { UserInputError, gql } = require("apollo-server-express")
const Tournament = require("../mongoose-models/tournament")
const Round = require("../mongoose-models/round")

const typeDef = gql`
  extend type Query {
    searchForTournamentById(id: String!): Tournament
    searchForTournaments(
      tournament_name: String
      region: Region
      player_name: String
      unique_id: String
      team_name: String
      comp: [String]
      stage: String
      mode: Mode
      page: Int
    ): TournamentCollection!
  }
  type Tournament {
    id: ID!
    name: String!
    bracket: String
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
  type TournamentCollection {
    tournaments: [Tournament]!
    pageCount: Int!
  }
  type Round {
    tournament_id: Tournament!
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
    winning_team_unique_ids: [String]!
    winning_team_weapons: [String!]!
    winning_team_main_abilities: [[Ability]!]!
    winning_team_sub_abilities: [[Ability]!]!
    losing_team_name: String!
    losing_team_players: [String!]!
    losing_team_unique_ids: [String]!
    losing_team_weapons: [String!]!
    losing_team_main_abilities: [[Ability]!]!
    losing_team_sub_abilities: [[Ability]!]!
  }
  enum Mode {
    SZ
    TC
    RM
    CB
    TW
  }
  enum Region {
    all
    western
    jpn
  }
`

const resolvers = {
  Query: {
    searchForTournamentById: async (root, args) => {
      if (!args.id.match(/^[0-9a-fA-F]{24}$/)) return null
      const rounds = await Round.find({ tournament_id: args.id })
        .sort({ round_number: "asc", game_number: "asc" })
        .catch((e) => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      const tournament = await Tournament.findById(args.id).catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })

      if (!tournament) return null
      tournament.rounds = rounds
      return tournament
    },
    searchForTournaments: async (root, args) => {
      Object.keys(args).forEach(
        (key) =>
          (args[key] == null || args[key].length === 0) && delete args[key]
      )

      const tournamentsPerPage = 18
      const currentPage = args.page ? args.page - 1 : 0

      const roundSearchCriteria = {
        $or: [],
      }

      if (args.team_name) {
        roundSearchCriteria.$or.push({
          winning_team_name: {
            $regex: new RegExp(
              args.team_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              "i"
            ),
          },
        })
        roundSearchCriteria.$or.push({
          losing_team_name: {
            $regex: new RegExp(
              args.team_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              "i"
            ),
          },
        })
      }

      if (args.player_name) {
        roundSearchCriteria.$or.push({
          winning_team_players: {
            $regex: new RegExp(
              args.player_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              "i"
            ),
          },
        })
        roundSearchCriteria.$or.push({
          losing_team_players: {
            $regex: new RegExp(
              args.player_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              "i"
            ),
          },
        })
      }

      if (args.unique_id) {
        roundSearchCriteria.$or.push({
          winning_team_unique_ids: {
            $regex: new RegExp(
              args.unique_id.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              "i"
            ),
          },
        })
        roundSearchCriteria.$or.push({
          losing_team_unique_ids: {
            $regex: new RegExp(
              args.unique_id.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              "i"
            ),
          },
        })
      }

      if (args.comp) {
        roundSearchCriteria.$or.push({
          winning_team_weapons: {
            $all: args.comp,
          },
        })

        roundSearchCriteria.$or.push({
          losing_team_weapons: {
            $all: args.comp,
          },
        })
      }

      if (args.mode) {
        roundSearchCriteria.mode = args.mode
      }

      if (args.stage) {
        roundSearchCriteria.stage = args.stage
      }

      // if criteria were presented that we have to search
      // from the Round collection
      let tournament_ids = null
      const tournamentSearchCriteria = {}

      if (args.region && args.region === "western")
        tournamentSearchCriteria.jpn = false
      if (args.region && args.region === "jpn")
        tournamentSearchCriteria.jpn = true

      if (roundSearchCriteria.$or.length === 0) {
        delete roundSearchCriteria.$or
      }

      if (
        roundSearchCriteria.$or ||
        roundSearchCriteria.stage ||
        roundSearchCriteria.mode
      ) {
        tournament_ids = await Round.find(roundSearchCriteria).distinct(
          "tournament_id"
        )

        tournamentSearchCriteria._id = {
          $in: tournament_ids,
        }
      }

      if (args.tournament_name)
        tournamentSearchCriteria.name = {
          $regex: new RegExp(
            args.tournament_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
            "i"
          ),
        }

      const tournamentCount = await Tournament.countDocuments(
        tournamentSearchCriteria
      ).catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })

      const pageCount = Math.ceil(tournamentCount / tournamentsPerPage)
      // if 0 documents we don't care if the page is wrong
      if (tournamentCount !== 0) {
        if (args.page > pageCount)
          throw new UserInputError("too big page number given", {
            invalidArgs: args,
          })
      }

      const tournaments = await Tournament.find(tournamentSearchCriteria)
        .skip(tournamentsPerPage * currentPage)
        .limit(tournamentsPerPage)
        .sort({ date: "desc" })
        .catch((e) => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      return { tournaments, pageCount }
    },
  },
}

module.exports = {
  Tournament: typeDef,
  tournamentResolvers: resolvers,
}
