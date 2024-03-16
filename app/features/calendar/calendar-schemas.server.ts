import { z } from "zod";
import { CALENDAR_EVENT } from "~/constants";
import type { CalendarEventTag } from "~/db/types";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import {
  FORMATS_SHORT,
  TOURNAMENT,
} from "~/features/tournament/tournament-constants";
import {
  actualNumber,
  checkboxValueToBoolean,
  date,
  falsyToNull,
  id,
  processMany,
  removeDuplicates,
  safeJSONParse,
  toArray,
} from "~/utils/zod";
import { calendarEventMaxDate, calendarEventMinDate } from "./calendar-utils";

export const newCalendarEventActionSchema = z
  .object({
    eventToEditId: z.preprocess(actualNumber, id.nullish()),
    name: z
      .string()
      .min(CALENDAR_EVENT.NAME_MIN_LENGTH)
      .max(CALENDAR_EVENT.NAME_MAX_LENGTH),
    description: z.preprocess(
      falsyToNull,
      z.string().max(CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH).nullable(),
    ),
    date: z.preprocess(
      toArray,
      z
        .array(
          z.preprocess(
            date,
            z.date().min(calendarEventMinDate()).max(calendarEventMaxDate()),
          ),
        )
        .min(1)
        .max(CALENDAR_EVENT.MAX_AMOUNT_OF_DATES),
    ),
    bracketUrl: z
      .string()
      .url()
      .max(CALENDAR_EVENT.BRACKET_URL_MAX_LENGTH)
      .default("https://sendou.ink"),
    discordInviteCode: z.preprocess(
      falsyToNull,
      z.string().max(CALENDAR_EVENT.DISCORD_INVITE_CODE_MAX_LENGTH).nullable(),
    ),
    tags: z.preprocess(
      processMany(safeJSONParse, removeDuplicates),
      z
        .array(
          z
            .string()
            .refine((val) =>
              CALENDAR_EVENT.TAGS.includes(val as CalendarEventTag),
            ),
        )
        .nullable(),
    ),
    badges: z.preprocess(
      processMany(safeJSONParse, removeDuplicates),
      z.array(id).nullable(),
    ),
    pool: z.string().optional(),
    toToolsEnabled: z.preprocess(checkboxValueToBoolean, z.boolean()),
    toToolsMode: z.enum(["ALL", "TO", "SZ", "TC", "RM", "CB"]).optional(),
    isRanked: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
    enableNoScreenToggle: z.preprocess(
      checkboxValueToBoolean,
      z.boolean().nullish(),
    ),
    //
    // tournament format related fields
    //
    format: z.enum(FORMATS_SHORT).nullish(),
    withUndergroundBracket: z.preprocess(checkboxValueToBoolean, z.boolean()),
    thirdPlaceMatch: z.preprocess(
      checkboxValueToBoolean,
      z.boolean().nullish(),
    ),
    autoCheckInAll: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
    teamsPerGroup: z.coerce
      .number()
      .min(TOURNAMENT.MIN_GROUP_SIZE)
      .max(TOURNAMENT.MAX_GROUP_SIZE)
      .nullish(),
    followUpBrackets: z.preprocess(
      safeJSONParse,
      z
        .array(
          z.object({
            name: z.string(),
            placements: z.array(z.number()),
          }),
        )
        .min(1)
        .nullish(),
    ),
  })
  .refine(
    async (schema) => {
      if (schema.eventToEditId) {
        const eventToEdit = await CalendarRepository.findById({
          id: schema.eventToEditId,
        });
        return schema.date.length === 1 || !eventToEdit?.tournamentId;
      } else {
        return schema.date.length === 1 || !schema.toToolsEnabled;
      }
    },
    {
      message: "Tournament must have exactly one date",
    },
  );
