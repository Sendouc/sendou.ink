import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { seed } from "./script";

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
