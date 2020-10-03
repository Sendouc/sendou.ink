import { gql, UserInputError } from "apollo-server-express";
import Weapon from "../models/Weapon";
import XRankPlacement from "../models/XRankPlacement";

const RECORDS_PER_PAGE = 25;

const paginatedResolvers = {
  pageCount: (root: any) => Math.ceil(root.total / RECORDS_PER_PAGE),
  recordsCount: (root: any) => root.total,
  records: (root: any) => root.results,
};

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
    getXRankPlacements(
      page: Int = 1
      filter: GetXRankPlacementsInput
    ): PaginatedXRankPlacements!
    getXRankLeaderboard(
      page: Int = 1
      type: XRankLeaderboardType!
    ): PaginatedXRankLeaderboard!
    getPeakXPowerLeaderboard(
      page: Int = 1
      weapon: String
    ): PaginatedXRankPlacements!
  }

  input GetXRankPlacementsInput {
    name: String
    mode: RankedMode
    month: Int
    year: Int
  }

  enum XRankLeaderboardType {
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

  type XRankLeaderboardEntry {
    score: Float!
    playerName: String!
    playerId: String!
    user: NewUser
  }

  type PaginatedXRankLeaderboard {
    records: [XRankLeaderboardEntry!]!
    recordsCount: Int!
    pageCount: Int!
  }

  # placeholder
  type Placement {
    name: String
  }
`;
const resolvers = {
  XRankPlacement: {
    xPower: (root: any) => root.xPower / 10,
    weapon: (root: any) => root.weapon.name,
    user: (root: any, _: any, ctx: any) => ctx.playerLoader.load(root.playerId),
  },
  PaginatedXRankPlacements: paginatedResolvers,
  XRankLeaderboardEntry: {
    playerName: (root: any, _: any, ctx: any) =>
      ctx.xRankPlayerNameLoader.load(root.playerId),
    // if score is over 10.000 it means it represents X Power
    score: (root: any) =>
      root.score > 10000 ? Math.round((root.score / 10) * 10) / 10 : root.score,
    user: (root: any, _: any, ctx: any) => ctx.playerLoader.load(root.playerId),
  },
  PaginatedXRankLeaderboard: paginatedResolvers,
  Query: {
    getXRankPlacements: async (_: any, args: any) => {
      return XRankPlacement.query()
        .modify("filterMode", args.filter?.mode)
        .modify("filterMonth", args.filter?.month)
        .modify("filterYear", args.filter?.year)
        .modify("filterName", args.filter?.name)
        .orderByRaw(
          `"year" desc, "month" desc, "ranking" asc, CASE WHEN mode = 'SZ' THEN 0 WHEN mode = 'TC' THEN 1 WHEN mode = 'RM' THEN 2 WHEN mode = 'CB' THEN 3 ELSE -1 END`
        )
        .page(args.page - 1, RECORDS_PER_PAGE)
        .withGraphFetched("weapon");
    },
    getXRankLeaderboard: async (_: any, args: any) => {
      switch (args.type) {
        case "FOUR_MODE_PEAK_AVERAGE":
          return XRankPlacement.query()
            .from(
              XRankPlacement.query()
                .select(["xRankPlacements.playerId", "xRankPlacements.mode"])
                .max("xPower as peak")
                .groupBy(["playerId", "mode"])
                .as("peakPowers")
            )
            .select("peakPowers.playerId")
            .avg("peak as score")
            .groupBy("playerId")
            .orderBy("score", "desc")
            .page(args.page - 1, RECORDS_PER_PAGE);
        case "PLACEMENTS_COUNT":
          return XRankPlacement.query()
            .select("playerId")
            .count("* as score")
            .groupBy("playerId")
            .orderBy("score", "desc")
            .page(args.page - 1, RECORDS_PER_PAGE);
        case "UNIQUE_WEAPONS_COUNT":
          return XRankPlacement.query()
            .select("xRankPlacements.playerId")
            .countDistinct("weapon_id as score")
            .groupBy("playerId")
            .orderBy("score", "desc")
            .page(args.page - 1, RECORDS_PER_PAGE);
        default:
          // should not be possible to occur
          throw new UserInputError("invalid leaderboard type");
      }
    },
    getPeakXPowerLeaderboard: (_: any, args: any) => {
      if (!args.weapon) {
        return XRankPlacement.query()
          .withGraphFetched("weapon")
          .from(
            XRankPlacement.query()
              .distinctOn("playerId")
              .orderBy(["playerId", { column: "xPower", order: "desc" }])
              .as("players")
          )
          .orderBy("xPower", "desc")
          .page(args.page - 1, RECORDS_PER_PAGE);
      }

      return XRankPlacement.query()
        .withGraphFetched("weapon")
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
        .page(args.page - 1, RECORDS_PER_PAGE);
    },
  },
};

module.exports = {
  Placement: typeDef,
  placementResolvers: resolvers,
};
