import fs from "fs";
import path from "path";
import prisma from "../client";

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
