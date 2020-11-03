import { arg, extendType, intArg, objectType, stringArg } from "@nexus/schema";

export const XRankPlacmement = objectType({
  name: "XRankPlacement",
  definition(t) {
    t.model.id();
    t.model.switchAccountId();
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
    t.model.switchAccountId();
    t.model.name();
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
        switchAccountId: stringArg({ nullable: false }),
      },
      resolve: (_root, args, ctx) => {
        return ctx.prisma.xRankPlacement.findMany({
          where: { switchAccountId: args.switchAccountId },
          orderBy: [{ month: "desc" }, { year: "desc" }],
        });
      },
    });
  },
});
