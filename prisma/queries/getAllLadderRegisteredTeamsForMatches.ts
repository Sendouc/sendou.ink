import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllLadderRegisteredTeamsForMatchesData =
  Prisma.PromiseReturnType<typeof getAllLadderRegisteredTeamsForMatches>;

export const getAllLadderRegisteredTeamsForMatches = async () =>
  prisma.ladderRegisteredTeam.findMany({
    select: {
      id: true,
      roster: {
        select: {
          id: true,
          trueSkill: true,
        },
      },
    },
  });
