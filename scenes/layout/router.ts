import { createRouter } from "../../utils/trpc-server";

export const layout = createRouter().query("getLoggedInUser", {
  resolve: ({ ctx }) => ctx.user,
});
