import { Prisma } from "@prisma/client";

const getXRankPlacements = (
  testUserId: number
): Prisma.XRankPlacementCreateArgs["data"][] => {
  const modes = ["SZ", "TC", "RM", "CB"];
  let ranking = 0;

  const result = Array(100)
    .fill(null)
    .map((_, i) => {
      const playerName = i % 2 === 0 ? `Player${i}` : `選手${i}`;
      const mode = modes.shift()!;
      modes.push(mode);

      if (mode === "SZ") ranking++;

      return {
        playerName,
        mode: mode as "SZ" | "TC" | "RM" | "CB",
        month: 12,
        year: 2020,
        ranking,
        xPower: 3000 - i * 0.5,
        weapon: "Splattershot Jr.",
        player:
          i === 0 || i > 3
            ? {
                create: {
                  switchAccountId: "" + i,
                  name: playerName,
                  user:
                    i === 0
                      ? {
                          connect: {
                            id: testUserId,
                          },
                        }
                      : undefined,
                },
              }
            : {
                connect: {
                  switchAccountId: "0",
                },
              },
      };
    });

  return result;
};

export default getXRankPlacements;
