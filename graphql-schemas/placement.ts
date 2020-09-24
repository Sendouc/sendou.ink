import { gql, UserInputError } from "apollo-server-express"
import { raw } from "objection"
import XRankPlacement from "../models/XRankPlacement"

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
*/

const typeDef = gql`
  extend type Query {
    getXRankPlacements: [XRankPlacement!]!
    getXRankLeaderboards(type: XRankLeaderboardType!): [XRankPlacement!]!
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
    playerId: String!
    playerName: String!
    ranking: Int!
    xPower: Float!
    weapon: String!
    mode: RankedMode!
    month: Int!
    year: Int!
    user: User
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
          return XRankPlacement.query()
            .from(
              XRankPlacement.query()
                .distinctOn("playerId")
                .orderBy(["playerId", { column: "xPower", order: "desc" }])
                .as("players")
            )
            .orderBy("xPower", "desc")
            .limit(100)
        case "WEAPON_PEAK_X_POWER":
          return []
        case "FOUR_MODE_PEAK_AVERAGE":
          const a = await XRankPlacement.query()
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
  },
  XRankPlacement: {
    xPower: (root: any) => root.xPower / 10,
  },
}

/*
              XRankPlacement.query()
                .where("playerId", ref("playerId"))
                .select("playerName"),*/

module.exports = {
  Placement: typeDef,
  placementResolvers: resolvers,
}
