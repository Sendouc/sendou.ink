import fs from "fs";
import path from "path";
import prisma from "../client";

// Include Prisma's .env file as well, so we can fetch the DATABASE_URL
require('dotenv').config({path: 'prisma/.env'});

const main = async () => {
  const patrons = await prisma.user.findMany({
    where: { patreonTier: { not: null } },
    orderBy: { patreonTier: "desc" },
    select: {
      username: true,
      discriminator: true,
      patreonTier: true,
      discordId: true,
    },
  });

  fs.writeFile(
    path.resolve(__dirname, "..", "..", "utils", "data", "patrons.json"),
    JSON.stringify(patrons),
    function (err) {
      if (err) throw err;
    }
  );
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
