import { gql, UserInputError } from "apollo-server-express"
import { raw } from "objection"
import UserObjection from "../models/User"
import Weapon from "../models/Weapon"
import XRankPlacement from "../models/XRankPlacement"
import Player from "../mongoose-models/player"
import User from "../mongoose-models/user"

const RECORDS_PER_PAGE = 25

/*
const placements = await Placement.find({ month: 12 })
      await XRankPlacement.query().insert(
        placements.map((p: any) => ({
          playerId: p.unique_id,
          playerName: p.name,
          ranking: p.rank,
          xPower: Math.round(p.x_power * 10),
          mode: ["", "SZ", "TC", "RM", "CB"][p.mode],
          month: p.month,
          year: p.year,
          weaponId: Weapon.query().findOne({ name: p.weapon }).select("id"),
        }))
      ) 


      const players = await Player.find({})
          const users = await User.find({})

          for (const player of players) {
            if (!player.twitter) continue

            const found = users.find(
              (u: any) => u.twitter_name === player.twitter
            )
            if (!found) continue

            await UserObjection.query()
              .patch({ playerId: player.unique_id })
              .where("discordId", "=", found.discord_id)
          }

          break
*/

const typeDef = gql`
  extend type Query {
    getXRankPlacements: [XRankPlacement!]!
    getXRankLeaderboards(type: XRankLeaderboardType!): [XRankPlacement!]!
    getPeakXPowerLeaderboard(
      page: Int = 1
      weapon: String
    ): PaginatedXRankPlacements!
  }

  enum XRankLeaderboardType {
    PEAK_X_POWER
    WEAPON_PEAK_X_POWER
    FOUR_MODE_PEAK_AVERAGE
    UNIQUE_WEAPONS_COUNT
    PLACEMENTS_COUNT
  }

  enum RankedMode {
    SZ
    TC
    RM
    CB
  }

  type XRankPlacement {
    id: ID!
    "Player's ID. Comes from their Nintendo Switch account."
    playerId: String!
    "Player's name at the time of the placement."
    playerName: String!
    "Player's ranking in the mode that month (1-500)"
    ranking: Int!
    xPower: Float!
    weapon: String!
    mode: RankedMode!
    month: Int!
    year: Int!
    user: NewUser
  }

  type PaginatedXRankPlacements {
    records: [XRankPlacement!]!
    recordsCount: Int!
    pageCount: Int!
  }

  type Placement {
    name: String
  }
`
const resolvers = {
  Query: {
    getXRankPlacements: async () => {
      return []
    },
    getXRankLeaderboards: async (_: any, { type }: any) => {
      switch (type) {
        case "PEAK_X_POWER":
          const players = await Player.find({})
          const users = await User.find({})

          for (const player of players) {
            if (!player.twitter) continue

            const found = users.find(
              (u: any) => u.twitter_name === player.twitter
            )
            if (!found) continue

            await UserObjection.query()
              .patch({ playerId: player.unique_id })
              .where("discordId", "=", found.discord_id)
          }

          break
        case "FOUR_MODE_PEAK_AVERAGE":
          const a = await XRankPlacement.query()
            .debug()
            .from(
              XRankPlacement.query()
                .select(["xRankPlacements.playerId", "xRankPlacements.mode"])
                .max("xPower as peak")
                .groupBy(["playerId", "mode"])
                .as("peakPowers")
            )
            .select("peakPowers.playerId")
            .avg("peak")
            .groupBy("playerId")
            .orderBy("avg", "desc")
            .page(10, 25)
          console.log(a)

          return []
        case "PLACEMENTS_COUNT":
          const p = await XRankPlacement.query()
            .select(["xRankPlacements.playerId", raw("count(*)")])
            .groupBy("playerId")
            .orderBy("count", "desc")
          console.log(p)

          return []
        case "UNIQUE_WEAPONS_COUNT":
          const l = await XRankPlacement.query()
            .select("xRankPlacements.playerId")
            .countDistinct("weapon_id")
            .groupBy("playerId")
            .orderBy("count", "desc")
            .page(10, 25)
          console.log(l)

          return []
        default:
          // should not be possible to occur
          throw new UserInputError("invalid leaderboard type")
      }
    },
    getPeakXPowerLeaderboard: (_: any, args: any) => {
      if (!args.weapon) {
        return XRankPlacement.query()
          .from(
            XRankPlacement.query()
              .distinctOn("playerId")
              .orderBy(["playerId", { column: "xPower", order: "desc" }])
              .as("players")
          )
          .orderBy("xPower", "desc")
          .page(args.page - 1, RECORDS_PER_PAGE)
          .withGraphFetched("weapon")
      }

      return XRankPlacement.query()
        .from(
          XRankPlacement.query()
            .distinctOn("playerId")
            .where(
              "weaponId",
              "=",
              Weapon.query().findOne({ name: args.weapon }).select("id")
            )
            .orderBy(["playerId", { column: "xPower", order: "desc" }])
            .as("players")
        )
        .orderBy("xPower", "desc")
        .page(args.page - 1, RECORDS_PER_PAGE)
        .withGraphFetched("weapon")
    },
  },
  XRankPlacement: {
    xPower: (root: any) => root.xPower / 10,
    weapon: (root: any) => root.weapon.name,
    user: (root: any) => null,
  },
  PaginatedXRankPlacements: {
    pageCount: (root: any) => Math.ceil(root.total / RECORDS_PER_PAGE),
    recordsCount: (root: any) => root.total,
    records: (root: any) => root.results,
  },
}

module.exports = {
  Placement: typeDef,
  placementResolvers: resolvers,
}
