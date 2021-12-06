import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { seed } from "./script";

const variation = process.argv[2]?.startsWith("-v=")
  ? process.argv[2].split("-v=")[1]
  : undefined;
if (variation !== undefined && variation !== "check-in") {
  throw Error("Unknown variation");
}

seed(variation)
  .then(() => {
    console.log(
      `🌱 All done with seeding${variation ? ` (variation: ${variation})` : ""}`
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
