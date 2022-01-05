import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
import { seed } from "./script";

const maybeVariation = process.argv[2]?.startsWith("-v=")
  ? process.argv[2].split("-v=")[1]
  : undefined;
const variation = z
  .enum(["check-in", "match"])
  .optional()
  .parse(maybeVariation);

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
