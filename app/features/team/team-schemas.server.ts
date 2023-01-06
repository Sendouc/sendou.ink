import { z } from "zod";
import { falsyToNull, id } from "~/utils/zod";
import { TEAM, TEAM_MEMBER_ROLES } from "./team-constants";

export const teamParamsSchema = z.object({ customUrl: z.string() });

export const editTeamSchema = z.union([
  z.object({
    _action: z.literal("DELETE"),
  }),
  z.object({
    _action: z.literal("EDIT"),
    name: z.string().min(TEAM.NAME_MIN_LENGTH).max(TEAM.NAME_MAX_LENGTH),
    bio: z.preprocess(
      falsyToNull,
      z.string().max(TEAM.BIO_MAX_LENGTH).nullable()
    ),
    twitter: z.preprocess(
      falsyToNull,
      z.string().max(TEAM.TWITTER_MAX_LENGTH).nullable()
    ),
  }),
]);

export const manageRosterSchema = z.union([
  z.object({
    _action: z.literal("RESET_INVITE_LINK"),
  }),
  z.object({
    _action: z.literal("DELETE_MEMBER"),
    userId: id,
  }),
  z.object({
    _action: z.literal("TRANSFER_OWNERSHIP"),
    newOwnerId: id,
  }),
  z.object({
    _action: z.literal("UPDATE_MEMBER_ROLE"),
    userId: id,
    role: z.union([z.enum(TEAM_MEMBER_ROLES), z.literal("")]),
  }),
]);
