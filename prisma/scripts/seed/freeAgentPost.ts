import { Prisma } from "@prisma/client";

const getFreeAgentPosts = (
  testUserId: number
): Prisma.FreeAgentPostCreateArgs["data"][] => {
  return [
    {
      canVC: "YES",
      content:
        "# Availability  \n Really good!\n\n*lorem ipsum* **lorem ipsum**",
      user: {
        connect: {
          id: testUserId,
        },
      },
      playstyles: ["FRONTLINE", "MIDLINE"],
    },
  ];
};

export default getFreeAgentPosts;
