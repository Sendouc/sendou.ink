import { ApolloServer } from "apollo-server-micro";
import { createContext } from "graphql/context";
import { schema } from "graphql/schema";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({
  schema,
  context: createContext,
  tracing: process.env.NODE_ENV === "development",
}).createHandler({ path: "/api/graphql" });
