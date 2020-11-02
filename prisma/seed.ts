//const { PrismaClient } = require("@prisma/client");
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
  const testUser = await prisma.user.create({
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
          sensMotion: 4.5,
          sensStick: -2.0,
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

  await prisma.xRankPlacement.deleteMany({});
  await prisma.player.deleteMany({});

  const getMode = (i: number) => {
    const j = i + 1;
    if (j % 4 === 0) return "CB";
    if (j % 2 === 0) return "TC";
    if (j % 3 === 0) return "RM";

    return "SZ";
  };

  await Promise.all(
    Array(100)
      .fill(null)
      .map((_, i) => {
        const playerName = i % 2 === 0 ? `Player${i}` : `選手${i}`;
        return prisma.xRankPlacement.create({
          data: {
            playerName,
            playerNameLower: i % 2 === 0 ? `player${i}` : `選手${i}`,
            mode: getMode(i),
            month: 12,
            year: 2020,
            ranking: Math.ceil((i + 1) / 4),
            xPower: 3000 - i * 0.5,
            weapon: "Splattershot Jr.",
            player: {
              create: {
                playerId: "" + i,
                names: [playerName],
                user:
                  i === 0
                    ? {
                        connect: {
                          id: testUser.id,
                        },
                      }
                    : undefined,
              },
            },
          },
        });
      })
  );

  console.log("X Rank placements created");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
