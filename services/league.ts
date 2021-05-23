import { LeagueType, Prisma, Region } from ".prisma/client";
import prisma from "prisma/client";
import { getWeaponNormalized } from "utils/lists/weapons";

const latestResult = async ({
  region,
  type,
}: {
  region: Region;
  type: LeagueType;
}) => {
  const squad = await prisma.leagueSquad.findFirst({
    where: { region, type },
    orderBy: { startTime: "desc" },
  });

  return squad?.startTime;
};

const createResults = async (
  data: {
    start_time: number;
    league_type: { key: "pair" | "team" };
    league_ranking_region: { code: "US" | "EU" | "JP" };
    rankings: {
      cheater: boolean;
      point: number;
      tag_members: {
        unique_id: string;
        principal_id: string;
        weapon: [string, string];
      }[];
    }[];
  }[]
) => {
  const freshest = await prisma.leagueSquad.findFirst({
    where: {
      type: data[0].league_type.key === "pair" ? "TWIN" : "QUAD",
      region:
        data[0].league_ranking_region.code === "US"
          ? "NA"
          : data[0].league_ranking_region.code,
    },
    orderBy: { startTime: "desc" },
  });
  if (!freshest) throw Error("that's not fresh");
  const squadsData: Prisma.LeagueSquadCreateManyInput[] = [];
  const playersData: Prisma.PlayerCreateManyInput[] = [];
  let oldestDate = new Date("2050");

  for (const rotation of data) {
    for (const ranking of rotation.rankings) {
      if (ranking.cheater) continue;
      if (ranking.point < 2200) continue;

      const startTime = new Date(rotation.start_time * 1000);

      if (startTime.getTime() <= freshest.startTime.getTime()) {
        continue;
      }

      if (startTime.getTime() < oldestDate.getTime()) {
        oldestDate = startTime;
      }

      squadsData.push({
        leaguePower: ranking.point,
        region:
          rotation.league_ranking_region.code === "US"
            ? "NA"
            : rotation.league_ranking_region.code,
        startTime,
        type: rotation.league_type.key === "pair" ? "TWIN" : "QUAD",
      });

      ranking.tag_members.forEach((member: any) => {
        playersData.push({
          switchAccountId: member.unique_id,
          principalId: member.principal_id,
        });
      });
    }
  }

  await Promise.all([
    prisma.leagueSquad.createMany({ data: squadsData }),
    prisma.player.createMany({ data: playersData, skipDuplicates: true }),
  ]);

  const createdSquads = await prisma.leagueSquad.findMany({
    where: { startTime: { gte: oldestDate } },
  });
  const ids = new Set<number>();
  const leagueMembersData: Prisma.LeagueSquadMemberCreateManyInput[] = [];

  for (const rotation of data) {
    for (const ranking of rotation.rankings) {
      if (ranking.cheater) continue;
      if (ranking.point < 2200) continue;

      const startTime = new Date(rotation.start_time * 1000);

      if (startTime.getTime() <= freshest.startTime.getTime()) {
        continue;
      }

      const type = rotation.league_type.key === "pair" ? "TWIN" : "QUAD";
      const region =
        rotation.league_ranking_region.code === "US"
          ? "NA"
          : rotation.league_ranking_region.code;

      const squad = createdSquads.find(
        (squad) =>
          squad.leaguePower === ranking.point &&
          squad.region === region &&
          squad.type === type &&
          squad.startTime.getTime() === startTime.getTime() &&
          !ids.has(squad.id)
      );

      if (!squad) throw Error("squad not found");

      ids.add(squad.id);

      ranking.tag_members.forEach((member) => {
        leagueMembersData.push({
          switchAccountId: member.unique_id,
          squadId: squad.id,
          weapon: getWeaponNormalized(member.weapon[1].trim()),
        });
      });
    }
  }

  await prisma.leagueSquadMember.createMany({ data: leagueMembersData });
};

export default {
  latestResult,
  createResults,
};
