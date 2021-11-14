import { z } from "zod";
import { createRouter } from "../../utils/trpc-server";
import { findTournamentByNameForUrl } from "./tournament-service";

export const tournament = createRouter().query("get", {
  input: z.string(),
  resolve: ({ input }) =>
    findTournamentByNameForUrl({
      organizationNameForUrl: "sendou",
      tournamentNameForUrl: input,
    }),
});
