import { z } from "zod";

export type LoggedInUser = z.infer<typeof LoggedInUserSchema>["user"];
export const LoggedInUserSchema = z.object({
  user: z
    .object({
      id: z.string(),
      discordId: z.string(),
      discordAvatar: z.string(),
    })
    .nullish(),
});
