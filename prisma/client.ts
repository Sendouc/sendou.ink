// @ts-nocheck
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (!global.prisma) {
  //global.prisma = new PrismaClient({ log: ["query", "info", "warn"] });
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default prisma;
