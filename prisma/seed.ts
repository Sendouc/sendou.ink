import fs from "fs";
import path from "path";
import prisma from "./client";
import {
  getPlusVotingSummaryData,
  getPlusSuggestionsData,
  getPlusStatusesData,
} from "./mocks/plus";
import userFactory from "./factories/user"

async function main() {
  throwIfNotLocalhost();
  await dropAllData();
  await seedNewData();
}

function throwIfNotLocalhost() {
  fs.readFile(
    path.join(process.cwd(), "prisma", ".env"),
    function (err: any, data: any) {
      if (!err) {
        for (const line of data.toString().split("\n")) {
          if (!line.startsWith("DATABASE_URL=")) {
            continue;
          }

          if (!line.includes("localhost:")) {
            console.error("trying to seed a database not in localhost");
            process.exit(1);
          }
        }
      } else {
        console.error(err);
        process.exit(1);
      }
    }
  );
}

async function dropAllData() {
  // TODO: Programatically clear/truncate all tables, rather than listing each model individually
  // That way, we won't need to update this method each time we add a new model
  await prisma.profile.deleteMany({});
  await prisma.build.deleteMany({});
  await prisma.salmonRunRecord.deleteMany({});
  await prisma.freeAgentPost.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.ladderPlayerTrueSkill.deleteMany({});
  await prisma.ladderMatchPlayer.deleteMany({});
  await prisma.plusVotingSummary.deleteMany({});
  await prisma.plusSuggestion.deleteMany({});
  await prisma.plusStatus.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedNewData() {
  const randomUsers = [...Array(10)].map((_, _i) => {
    return userFactory.build();
  })
  const sendouUser = userFactory.build({username: "Sendou", patreonTier: 1});
  const nzapUser = userFactory.build({username: "NZAP"});

  await prisma.user.createMany({data: [
    ...randomUsers,
    sendouUser,
    nzapUser
  ]})

  await prisma.plusStatus.createMany({ data: getPlusStatusesData() });
  await prisma.plusSuggestion.createMany({ data: getPlusSuggestionsData() });
  await prisma.plusVotingSummary.createMany({
    data: getPlusVotingSummaryData(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
