import { extendType, objectType } from "@nexus/schema";

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
    // TODO: limit so that you can only get max 100 results max and 50 by default
    t.crud.xRankPlacements({
      ordering: { ranking: true, month: true, year: true },
      async resolve(
        root: any,
        args: any,
        ctx: any,
        info: any,
        originalResolve: any
      ) {
        console.log({ args: args.orderBy });
        if (!args.first && !args.last) args.first = 50;

        args.first = Math.min(args.first, 100);
        args.last = Math.min(args.last, 100);
        return originalResolve(root, args, ctx, info);
      },
    });
  },
});
