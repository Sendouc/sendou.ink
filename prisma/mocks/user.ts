import { Prisma } from "@prisma/client";

export const getUsersData = (): Prisma.UserCreateManyInput[] => {
  return [
    {
      id: 1,
      discordId: "79237403620945920",
      username: "Sendou",
      discriminator: "4059",
      patreonTier: 1,
      discordAvatar: "1e0968214a6ea74aebce4bbd699d6aae",
    },
    ...new Array(9).fill(null).map((_, i) => ({
      id: i + 2,
      discordId: padWithZero(i, 17),
      discriminator: padWithZero(i, 4),
      username: `User${i + 2}`,
    })),
  ];
};

function padWithZero(root: number, totalLength: number) {
  let result = "" + root;
  while (result.length < totalLength) {
    result += "0";
  }

  return result;
}
