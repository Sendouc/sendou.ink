import { arg, extendType, intArg, objectType, stringArg } from "@nexus/schema";

export const XRankPlacmement = objectType({
  name: "XRankPlacement",
  definition(t) {
    t.model.id();
    t.model.playerId();
    t.model.playerName();
    t.model.ranking();
    t.model.xPower();
    t.model.weapon();
    t.model.mode();
    t.model.month();
    t.model.year();
    t.model.player();
  },
});

export const Player = objectType({
  name: "Player",
  definition(t) {
    t.model.playerId();
    t.model.names({
      description:
        "Set of names player has had in Top 500 results. The most recent one is the first one of the list.",
    });
    t.model.user();
    t.model.placements();
  },
});

// FIXME: also extendType in user.ts
export const Query = extendType({
  type: "Query",
  definition(t) {
    t.field("getXRankPlacements", {
      type: "XRankPlacement",
      nullable: false,
      list: [true],
      args: {
        year: intArg({ nullable: false }),
        month: intArg({ nullable: false }),
        mode: arg({ type: "RankedMode", nullable: false }),
      },
      resolve: (_root, args, ctx) => {
        return ctx.prisma.xRankPlacement.findMany({
          where: { month: args.month, year: args.year, mode: args.mode },
          orderBy: { ranking: "asc" },
        });
      },
    });

    t.field("getPlayersXRankPlacements", {
      type: "XRankPlacement",
      nullable: false,
      list: [true],
      args: {
        playerId: stringArg({ nullable: false }),
      },
      resolve: (_root, args, ctx) => {
        return ctx.prisma.xRankPlacement.findMany({
          where: { playerId: args.playerId },
          orderBy: [{ month: "desc" }, { year: "desc" }],
        });
      },
    });
  },
});
