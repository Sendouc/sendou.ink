import { Prisma } from "@prisma/client";

const getFreeAgentPosts = (
  testUserId: number,
  otherUserIds: number[]
): Prisma.FreeAgentPostCreateArgs["data"][] => {
  const result: Prisma.FreeAgentPostCreateArgs["data"][] = [
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

  otherUserIds
    .map((id) => ({
      canVC: "MAYBE" as const,
      content: `User with id ${id} ready to be recruited`,
      playstyles: ["BACKLINE"] as "BACKLINE"[],
      user: {
        connect: {
          id,
        },
      },
    }))
    .forEach((fa) => result.push(fa));

  return result;
};

export default getFreeAgentPosts;
