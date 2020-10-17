import { PrismaClient } from "@prisma/client";
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const main = async () => {
  fs.readFile(path.join(__dirname, "/.env"), function (err: any, data: any) {
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
  });

  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.user.create({
    data: {
      username: "N-ZAP",
      discriminator: "6227",
      discordId: "455039198672453645",
      discordAvatar: "f809176af93132c3db5f0a5019e96339",
      profile: {
        create: {
          bio: "My cool bio! Supports markdown too: **bolded**",
          country: "US",
          customUrlPath: "tester",
          sensMotion: 45,
          sensStick: -20,
          weaponPool: [
            "Tenta Brella",
            "Range Blaster",
            "Luna Blaster",
            "N-ZAP '89",
          ],
          twitterName: "nintendovs",
          twitchName: "nintendo",
          youtubeId: "UCAtobAxsQcACwDZCSH9uJfA",
        },
      },
    },
  });

  console.log("User created");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
