import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express/dist/trpc-server-adapters-express.cjs";
import superjson from "superjson";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => {
    if (!req.user) {
      return;
    }
    return req.user as {
      id: number;
      discordId: string;
      discordAvatar?: string;
    };
  };

  return {
    req,
    res,
    user: getUser(),
  };
};
type Context = trpc.inferAsyncReturnType<typeof createContext>;

export function createRouter() {
  return trpc.router<Context>().transformer(superjson);
}
