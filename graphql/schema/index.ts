import { makeSchema } from "@nexus/schema";
import * as userTypes from "graphql/schema/user";
import * as xRankPlacementTypes from "graphql/schema/xRankPlacement";
import { nexusPrisma } from "nexus-plugin-prisma";
import path from "path";

export const schema = makeSchema({
  types: [userTypes, xRankPlacementTypes],
  // FIXME: set complexity plugin
  plugins: [nexusPrisma({ experimentalCRUD: true })],
  outputs: {
    // FIXME: should be in graphql/generated instead root
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "nexus-typegen.ts"),
  },
  typegenAutoConfig: {
    contextType: "Context.Context",
    sources: [
      {
        source: ".prisma/client",
        alias: "Prisma",
      },
      {
        source: require.resolve("graphql/context"),
        alias: "Context",
      },
    ],
  },
});
