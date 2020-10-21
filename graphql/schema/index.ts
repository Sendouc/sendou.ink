import { fieldAuthorizePlugin, makeSchema } from "@nexus/schema";
import * as userTypes from "graphql/schema/user";
import { nexusSchemaPrisma } from "nexus-plugin-prisma/schema";
import path from "path";

export const schema = makeSchema({
  types: [userTypes],
  // FIXME: set complexity plugin
  plugins: [nexusSchemaPrisma(), fieldAuthorizePlugin()],
  outputs: {
    // FIXME: should be in graphql/generated instead root
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "nexus-typegen.ts"),
  },
  nonNullDefaults: {
    input: false,
    output: true,
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
