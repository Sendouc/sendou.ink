import { z } from "zod";
import {
  _action,
  checkboxValueToBoolean,
  id,
  modeShort,
  safeJSONParse,
  stageId,
} from "~/utils/zod";
import { TOURNAMENT } from "./tournament-constants";
import { bracketIdx } from "../tournament-bracket/tournament-bracket-schemas.server";

export const registerSchema = z.union([
  z.object({
    _action: _action("UPSERT_TEAM"),
    teamName: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
    prefersNotToHost: z.preprocess(checkboxValueToBoolean, z.boolean()),
  }),
  z.object({
    _action: _action("UPDATE_MAP_POOL"),
    mapPool: z.preprocess(
      safeJSONParse,
      z.array(z.object({ stageId, mode: modeShort })),
    ),
  }),
  z.object({
    _action: _action("DELETE_TEAM_MEMBER"),
    userId: id,
  }),
  z.object({
    _action: _action("CHECK_IN"),
  }),
  z.object({
    _action: _action("ADD_PLAYER"),
    userId: id,
  }),
  z.object({
    _action: _action("UNREGISTER"),
  }),
]);

export const seedsActionSchema = z.object({
  seeds: z.preprocess(safeJSONParse, z.array(id)),
});

export const adminActionSchema = z.union([
  z.object({
    _action: _action("UPDATE_SHOW_MAP_LIST_GENERATOR"),
    show: z.preprocess(checkboxValueToBoolean, z.boolean()),
  }),
  z.object({
    _action: _action("CHANGE_TEAM_OWNER"),
    teamId: id,
    memberId: id,
  }),
  z.object({
    _action: _action("CHECK_IN"),
    teamId: id,
    bracketIdx,
  }),
  z.object({
    _action: _action("CHECK_OUT"),
    teamId: id,
    bracketIdx,
  }),
  z.object({
    _action: _action("ADD_MEMBER"),
    teamId: id,
    userId: id,
  }),
  z.object({
    _action: _action("REMOVE_MEMBER"),
    teamId: id,
    memberId: id,
  }),
  z.object({
    _action: _action("DELETE_TEAM"),
    teamId: id,
  }),
  z.object({
    _action: _action("ADD_TEAM"),
    userId: id,
    teamName: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
  }),
  z.object({
    _action: _action("ADD_STAFF"),
    userId: id,
    role: z.enum(["ORGANIZER", "STREAMER"]),
  }),
  z.object({
    _action: _action("REMOVE_STAFF"),
    userId: id,
  }),
  z.object({
    _action: _action("UPDATE_CAST_TWITCH_ACCOUNTS"),
    castTwitchAccounts: z.preprocess(
      (val) =>
        typeof val === "string"
          ? val
              .split(",")
              .map((account) => account.trim())
              .map((account) => account.toLowerCase())
          : val,
      z.array(z.string()),
    ),
  }),
  z.object({
    _action: _action("RESET_BRACKET"),
    stageId: id,
  }),
]);

export const joinSchema = z.object({
  trust: z.preprocess(checkboxValueToBoolean, z.boolean()),
});
