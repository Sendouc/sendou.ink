import { z } from "zod";
import { falsyToNull } from "~/utils/zod";
import { TEAM } from "./team-constants";

export const teamParamsSchema = z.object({ customUrl: z.string() });

export const editTeamSchema = z.object({
  name: z.string().min(TEAM.NAME_MIN_LENGTH).max(TEAM.NAME_MAX_LENGTH),
  bio: z.preprocess(
    falsyToNull,
    z.string().max(TEAM.BIO_MAX_LENGTH).nullable()
  ),
  twitter: z.preprocess(
    falsyToNull,
    z.string().max(TEAM.TWITTER_MAX_LENGTH).nullable()
  ),
});
