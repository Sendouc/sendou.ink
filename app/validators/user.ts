import { z } from "zod";

export type LoggedInUser = NonNullable<
  z.infer<typeof LoggedInUserSchema>
>["user"];
export const LoggedInUserSchema = z
  .object({
    user: z
      .object({
        id: z.string(),
        discordId: z.string(),
        discordAvatar: z.string().nullable(),
      })
      .nullish(),
  })
  .nullish();
