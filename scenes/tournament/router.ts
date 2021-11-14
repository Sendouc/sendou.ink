import { z } from "zod";
import { createRouter } from "../../utils/trpc-server";
import { findTournamentByNameForUrl } from "./service";

export const tournament = createRouter().query("get", {
  input: z.object({
    organization: z.string(),
    tournament: z.string(),
  }),
  resolve: ({ input }) =>
    findTournamentByNameForUrl({
      organizationNameForUrl: input.organization,
      tournamentNameForUrl: input.tournament,
    }),
});
