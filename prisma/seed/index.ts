import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { seed } from "./script";

const legalVariations = ["check-in", "match"];

const variation = process.argv[2]?.startsWith("-v=")
  ? process.argv[2].split("-v=")[1]
  : undefined;
if (variation !== undefined && !legalVariations.includes(variation)) {
  throw Error("Unknown variation");
}

seed(variation as any)
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
