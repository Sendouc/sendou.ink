import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express/dist/trpc-server-adapters-express.cjs";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => {
    console.log("req.user", req.user);
    if (req.user !== "secret") {
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
  return trpc.router<Context>();
}
