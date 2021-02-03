import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getWeaponNormalized } from "../../lib/lists/weapons";
import prisma from "../client";

const files = ["P_EU", "P_US", "T_EU", "T_US", "P_JP", "T_JP"];

let oldestDate = new Date("2050");

async function main() {
  for (const file of files) {
    const squadsData: Prisma.LeagueSquadCreateManyInput[] = [];
    const playersData: Prisma.PlayerCreateManyInput[] = [];
    const data = fs.readFileSync(
      path.resolve(__dirname, `./data/league/${file}.json`)
    );
    const league = JSON.parse(data.toString());

    for (const rotation of league) {
      for (const ranking of rotation.rankings) {
        if (ranking.cheater) continue;
        if (ranking.point < 2200) continue;

        const startTime = new Date(rotation.start_time * 1000);

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

    console.log("oldest = ", oldestDate.getTime());

    await prisma.leagueSquad.createMany({ data: squadsData });

    console.log("leagueSquads created");

    await prisma.player.createMany({ data: playersData, skipDuplicates: true });

    console.log("players created");

    const createdSquads = await prisma.leagueSquad.findMany({
      where: { startTime: { gte: oldestDate } },
    });
    const ids = new Set<number>();
    const leagueMembersData: Prisma.LeagueSquadMemberCreateManyInput[] = [];

    for (const rotation of league) {
      for (const ranking of rotation.rankings) {
        if (ranking.cheater) continue;
        if (ranking.point < 2200) continue;

        const startTime = new Date(rotation.start_time * 1000);

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

        ranking.tag_members.forEach((member: any) => {
          leagueMembersData.push({
            switchAccountId: member.unique_id,
            squadId: squad.id,
            weapon: getWeaponNormalized(member.weapon[1].trim()),
          });
        });
      }
    }

    await prisma.leagueSquadMember.createMany({ data: leagueMembersData });

    console.log("members created");

    console.log("done with", file);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
