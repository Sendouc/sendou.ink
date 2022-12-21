import { z } from "zod";
import { id } from "~/utils/zod";
import { FRIEND_CODE_REGEX_PATTERN, TOURNAMENT } from "./tournament-constants";

export const registerSchema = z.union([
  z.object({ _action: z.literal("CREATE_TEAM") }),
  z.object({
    _action: z.literal("UPDATE_TEAM_INFO"),
    teamName: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
    friendCode: z.string().regex(new RegExp(FRIEND_CODE_REGEX_PATTERN)),
  }),
  z.object({
    _action: z.literal("UPDATE_MAP_POOL"),
    mapPool: z.string(),
  }),
  z.object({
    _action: z.literal("DELETE_TEAM_MEMBER"),
    userId: id,
  }),
]);
