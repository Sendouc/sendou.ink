import { Prisma } from "@prisma/client";

export const getUsersData = (): Prisma.UserCreateManyInput[] => {
  return [
    ...new Array(10).fill(null).map((_, i) => ({
      id: i + 1,
      discordId: padWithZero(i, 17),
      discriminator: padWithZero(i, 4),
      username: `User${i + 1}`,
    })),
    {
      id: 11,
      discordId: "79237403620945920",
      username: "Sendou",
      discriminator: "4059",
      patreonTier: 1,
      discordAvatar: "1e0968214a6ea74aebce4bbd699d6aae",
    },
    {
      id: 12,
      discordId: "455039198672453645",
      username: "NZAP",
      discriminator: "6227",
      discordAvatar: "f809176af93132c3db5f0a5019e96339",
    },
  ];
};

function padWithZero(root: number, totalLength: number) {
  let result = "" + root;
  while (result.length < totalLength) {
    result += "0";
  }

  return result;
}
