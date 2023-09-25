import { z } from "zod";
import { _action, falsyToNull, id, jsonParseable } from "~/utils/zod";
import { TEAM, TEAM_MEMBER_ROLES } from "./team-constants";

export const teamParamsSchema = z.object({ customUrl: z.string() });

export const createTeamSchema = z.object({
  name: z.string().min(TEAM.NAME_MIN_LENGTH).max(TEAM.NAME_MAX_LENGTH),
});

export const editTeamSchema = z.union([
  z.object({
    _action: _action("DELETE"),
  }),
  z.object({
    _action: _action("EDIT"),
    name: z.string().min(TEAM.NAME_MIN_LENGTH).max(TEAM.NAME_MAX_LENGTH),
    bio: z.preprocess(
      falsyToNull,
      z.string().max(TEAM.BIO_MAX_LENGTH).nullable(),
    ),
    twitter: z.preprocess(
      falsyToNull,
      z.string().max(TEAM.TWITTER_MAX_LENGTH).nullable(),
    ),
    css: z.preprocess(falsyToNull, z.string().refine(jsonParseable).nullable()),
  }),
]);

export const manageRosterSchema = z.union([
  z.object({
    _action: _action("RESET_INVITE_LINK"),
  }),
  z.object({
    _action: _action("DELETE_MEMBER"),
    userId: id,
  }),
  z.object({
    _action: _action("TRANSFER_OWNERSHIP"),
    newOwnerId: id,
  }),
  z.object({
    _action: _action("UPDATE_MEMBER_ROLE"),
    userId: id,
    role: z.union([z.enum(TEAM_MEMBER_ROLES), z.literal("")]),
  }),
]);
