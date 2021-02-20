import { User } from "@prisma/client";

export const formatUsername = (
  user: Pick<User, "discriminator" | "username">
) => `${user.username}#${user.discriminator}`;
