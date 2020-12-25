import { Ability, Prisma } from "@prisma/client";

const getBuilds = (testUserId: number): Prisma.BuildCreateArgs["data"][] => {
  const result = [
    {
      user: {
        connect: {
          id: testUserId,
        },
      },
      weapon: "Splattershot Jr.",
      headAbilities: ["SS", "SS", "SS", "SS"] as Ability[],
      clothingAbilities: ["SS", "SS", "SS", "SS"] as Ability[],
      shoesAbilities: ["SS", "SS", "SS", "SS"] as Ability[],
      title: "Amazing test build",
      description: "Just testing.",
      top500: true,
      jpn: false,
      abilityPoints: {
        SS: 57,
      },
    },
    {
      user: {
        connect: {
          id: testUserId,
        },
      },
      weapon: "Splattershot Jr.",
      headAbilities: ["QR", "QR", "QR", "QR"] as Ability[],
      clothingAbilities: ["QR", "QR", "QR", "QR"] as Ability[],
      shoesAbilities: ["QR", "QR", "QR", "QR"] as Ability[],
      title: "SECOND test build",
      description: "Just testing again.",
      top500: true,
      jpn: false,
      abilityPoints: {
        QR: 57,
      },
    },
  ];

  return result;
};

export default getBuilds;
