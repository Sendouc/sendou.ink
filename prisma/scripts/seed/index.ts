import fs from "fs";
import path from "path";
import prisma from "../../client";
import getBuilds from "./build";
import getFreeAgentPosts from "./freeAgentPost";
import getUsers from "./user";

const main = async () => {
  throwIfNotLocalhost();
  await deleteExistingRecords();

  const [testUser] = await Promise.all(
    getUsers().map((data) =>
      prisma.user.create({
        data,
      })
    )
  );

  console.log("Users created");

  // await Promise.all(
  //   getXRankPlacements(testUser.id).map((data) =>
  //     prisma.xRankPlacement.create({
  //       data,
  //     })
  //   )
  // );

  // console.log("X Rank placements created");

  await Promise.all(
    getBuilds(testUser.id).map((data) => prisma.build.create({ data }))
  );

  console.log("Builds created");

  await Promise.all(
    getFreeAgentPosts(testUser.id).map((data) =>
      prisma.freeAgentPost.create({ data })
    )
  );

  console.log("FA posts created");
};

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

async function deleteExistingRecords() {
  await prisma.freeAgentPost.deleteMany({});
  await prisma.salmonRunRecord.deleteMany({});
  await prisma.salmonRunRotation.deleteMany({});
  await prisma.build.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.xRankPlacement.deleteMany({});
  await prisma.player.deleteMany({});
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
