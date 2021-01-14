import * as z from "zod";

const TEAM_BIO_CHARACTER_LIMIT = 7000;
const TEAM_RECRUITING_POST_CHARACTER_LIMIT = 2000;

export const teamSchema = z.object({
  twitterName: z.string().max(15).optional().nullable(),
  bio: z.string().max(TEAM_BIO_CHARACTER_LIMIT).optional().nullable(),
  recruitingPost: z
    .string()
    .max(TEAM_RECRUITING_POST_CHARACTER_LIMIT)
    .optional()
    .nullable(),
});
