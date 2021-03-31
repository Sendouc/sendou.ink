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

async function seedNewData() {
  await seedUsers();
  await prisma.plusStatus.createMany({ data: getPlusStatusesData() });
  await prisma.plusSuggestion.createMany({ data: getPlusSuggestionsData() });
  await prisma.plusVotingSummary.createMany({
    data: getPlusVotingSummaryData(),
  });
}

async function seedUsers() {
  const randomUsers = [...Array(10)].map((_, _i) => {
    return userFactory.build();
  })

  await prisma.user.createMany({data: [
    ...randomUsers,
    userFactory.build({username: "Sendou", patreonTier: 1}),
    userFactory.build({username: "NZAP"})
  ]})
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
