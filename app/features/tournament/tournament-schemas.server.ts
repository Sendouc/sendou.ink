import { z } from "zod";
import { checkboxValueToBoolean, id, safeJSONParse } from "~/utils/zod";
import { TOURNAMENT } from "./tournament-constants";

export const registerSchema = z.union([
  z.object({
    _action: z.literal("UPSERT_TEAM"),
    teamName: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
    prefersNotToHost: z.preprocess(checkboxValueToBoolean, z.boolean()),
  }),
  z.object({
    _action: z.literal("UPDATE_MAP_POOL"),
    mapPool: z.string(),
  }),
  z.object({
    _action: z.literal("DELETE_TEAM_MEMBER"),
    userId: id,
  }),
  z.object({
    _action: z.literal("CHECK_IN"),
  }),
  z.object({
    _action: z.literal("ADD_PLAYER"),
    userId: id,
  }),
  z.object({
    _action: z.literal("UNREGISTER"),
  }),
]);

export const seedsActionSchema = z.object({
  seeds: z.preprocess(safeJSONParse, z.array(id)),
});

export const adminActionSchema = z.union([
  z.object({
    _action: z.literal("UPDATE_SHOW_MAP_LIST_GENERATOR"),
    show: z.preprocess(checkboxValueToBoolean, z.boolean()),
  }),
  z.object({
    _action: z.literal("CHANGE_TEAM_OWNER"),
    teamId: id,
    memberId: id,
  }),
  z.object({
    _action: z.literal("CHECK_IN"),
    teamId: id,
  }),
  z.object({
    _action: z.literal("CHECK_OUT"),
    teamId: id,
  }),
  z.object({
    _action: z.literal("ADD_MEMBER"),
    teamId: id,
    "user[value]": id,
  }),
  z.object({
    _action: z.literal("REMOVE_MEMBER"),
    teamId: id,
    memberId: id,
  }),
  z.object({
    _action: z.literal("DELETE_TEAM"),
    teamId: id,
  }),
]);

export const joinSchema = z.object({
  trust: z.preprocess(checkboxValueToBoolean, z.boolean()),
});
