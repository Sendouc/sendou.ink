import { z } from "zod";
import {
  _action,
  checkboxValueToBoolean,
  id,
  modeShort,
  optionalId,
  safeJSONParse,
  stageId,
} from "~/utils/zod";
import { TOURNAMENT } from "./tournament-constants";
import { bracketIdx } from "../tournament-bracket/tournament-bracket-schemas.server";
import { USER } from "~/constants";

const teamName = z.string().trim().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH);

export const registerSchema = z.union([
  z.object({
    _action: _action("UPSERT_TEAM"),
    teamName,
    prefersNotToHost: z.preprocess(checkboxValueToBoolean, z.boolean()),
    noScreen: z.preprocess(checkboxValueToBoolean, z.boolean()),
    teamId: optionalId,
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
    _action: _action("LEAVE_TEAM"),
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
    _action: _action("CHANGE_TEAM_NAME"),
    teamId: id,
    teamName,
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
    teamName,
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
    _action: _action("DROP_TEAM_OUT"),
    teamId: id,
  }),
  z.object({
    _action: _action("UNDO_DROP_TEAM_OUT"),
    teamId: id,
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
  z.object({
    _action: _action("UPDATE_IN_GAME_NAME"),
    inGameNameText: z.string().max(USER.IN_GAME_NAME_TEXT_MAX_LENGTH),
    inGameNameDiscriminator: z
      .string()
      .refine((val) => /^[0-9a-z]{4,5}$/.test(val)),
    memberId: id,
  }),
]);

export const joinSchema = z.object({
  trust: z.preprocess(checkboxValueToBoolean, z.boolean()),
});
