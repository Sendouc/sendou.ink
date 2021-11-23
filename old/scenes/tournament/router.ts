import { z } from "zod";
import { createRouter } from "../../utils/trpc-server";
import { createTournamentTeam, findTournamentByNameForUrl } from "./service";

export const tournament = createRouter()
  .query("get", {
    input: z.object({
      organization: z.string(),
      tournament: z.string(),
    }),
    resolve: ({ input }) =>
      findTournamentByNameForUrl({
        organizationNameForUrl: input.organization,
        tournamentNameForUrl: input.tournament,
      }),
  })
  .mutation("createTournamentTeam", {
    input: z.object({
      // TODO: validator
      name: z.string(),
      tournamentId: z.number(),
    }),
    // TODO: auth middleware
    resolve: ({ input, ctx }) =>
      createTournamentTeam({
        userId: ctx.user!.id,
        name: input.name,
        tournamentId: input.tournamentId,
      }),
  });
