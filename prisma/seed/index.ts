import { PrismaClient } from "@prisma/client";
import { SeedVariationsSchema } from "~/utils/schemas";
const prisma = new PrismaClient();
import { seed } from "./script";

const maybeVariation = process.argv[2]?.startsWith("-v=")
  ? process.argv[2].split("-v=")[1]
  : undefined;
const variation = SeedVariationsSchema.optional().parse(maybeVariation);

seed(variation)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(
      `🌱 All done with seeding${variation ? ` (variation: ${variation})` : ""}`
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((err) => console.error(err));
  });
