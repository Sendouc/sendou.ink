import { z } from "zod";
import { id, safeJSONParse } from "~/utils/zod";
import { TOURNAMENT } from "./tournament-constants";

export const registerSchema = z.union([
  z.object({
    _action: z.literal("UPSERT_TEAM"),
    teamName: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
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
]);

export const seedsActionSchema = z.object({
  seeds: z.preprocess(safeJSONParse, z.array(id)),
});
