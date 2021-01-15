import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllTeamsData = Prisma.PromiseReturnType<typeof getAllTeams>;

export const getAllTeams = async () => {
  return (
    await prisma.team.findMany({
      select: {
        id: true,
        recruitingPost: true,
        twitterName: true,
        name: true,
        nameForUrl: true,
        roster: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            profile: {
              select: {
                country: true,
              },
            },
            player: {
              select: {
                placements: {
                  orderBy: {
                    xPower: "desc",
                  },
                  take: 1,
                  select: {
                    xPower: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  ).map((team) => {
    return {
      ...team,
      countries: team.roster
        .reduce((acc: [string, number][], cur) => {
          if (!cur.profile?.country) return acc;

          const countryTuple = acc.find(
            ([country]) => country === cur.profile?.country
          );
          if (!countryTuple) acc.push([cur.profile.country, 1]);
          else countryTuple[1]++;

          return acc;
        }, [])
        .sort((a, b) => b[1] - a[1])
        .map((tuple) => tuple[0]),
      teamXP:
        team.roster
          .reduce(
            (acc: number[], cur) => {
              const placement = cur.player?.placements[0];
              if (!placement) return acc;

              acc.sort((a, b) => b - a);

              if (acc[3] < placement.xPower) {
                acc[3] = placement.xPower;
              }

              return acc;
            },
            [2000, 2000, 2000, 2000]
          )
          .reduce((acc, cur) => acc + cur, 0) / 4,
    };
  });
};
