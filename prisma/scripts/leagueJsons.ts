import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getWeaponNormalized } from "../../lib/lists/weapons";
import prisma from "../client";

const files = ["P_EU", "P_US", "T_EU", "T_US", "P_JP", "T_JP"];

async function main() {
  for (const file of files) {
    const squads: Prisma.LeagueSquadCreateInput[] = [];
    const data = fs.readFileSync(
      path.resolve(__dirname, `./data/league/${file}.json`)
    );
    const league = JSON.parse(data.toString());

    for (const rotation of league) {
      //Math.ceil(league.length / 2), league.length
      for (const ranking of rotation.rankings) {
        if (ranking.cheater) continue;
        if (ranking.point < 2200) continue;

        squads.push({
          leaguePower: ranking.point,
          region:
            rotation.league_ranking_region.code === "US"
              ? "NA"
              : rotation.league_ranking_region.code,
          startTime: new Date(rotation.start_time),
          type: rotation.league_type.key === "pair" ? "TWIN" : "QUAD",
          members: {
            create: ranking.tag_members.map((member: any) => ({
              weapon: getWeaponNormalized(member.weapon[1]),
              player: {
                connectOrCreate: {
                  create: {
                    switchAccountId: member.unique_id,
                  },
                  where: {
                    switchAccountId: member.unique_id,
                  },
                },
              },
            })),
          },
        });
      }
    }

    const newSquads = squads.map((input) =>
      prisma.leagueSquad.create({ data: input })
    );

    await prisma.$transaction([...newSquads]);
    console.log("done with", file);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
