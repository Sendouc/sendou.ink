import type { ActionFunction } from "@remix-run/node";
import {
  redirect,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { z } from "zod";
import type { CalendarEventTag } from "~/db/types";
import { requireUser } from "~/features/auth/core/user.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { tournamentFromDB } from "~/features/tournament-bracket/core/Tournament.server";
import {
  FORMATS_SHORT,
  TOURNAMENT,
} from "~/features/tournament/tournament-constants";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { canEditCalendarEvent } from "~/permissions";
import {
  databaseTimestampToDate,
  dateToDatabaseTimestamp,
} from "~/utils/dates";
import { badRequestIfFalsy, parseFormData, validate } from "~/utils/remix";
import { calendarEventPage } from "~/utils/urls";
import {
  actualNumber,
  checkboxValueToBoolean,
  date,
  falsyToNull,
  hexCode,
  id,
  processMany,
  removeDuplicates,
  safeJSONParse,
  toArray,
} from "~/utils/zod";
import { canAddNewEvent, regClosesAtDate } from "../calendar-utils";
import {
  canCreateTournament,
  formValuesToBracketProgression,
} from "../calendar-utils.server";
import { CALENDAR_EVENT, REG_CLOSES_AT_OPTIONS } from "../calendar-constants";
import { calendarEventMaxDate, calendarEventMinDate } from "../calendar-utils";
import { nanoid } from "nanoid";
import { s3UploadHandler } from "~/features/img-upload";
import invariant from "~/utils/invariant";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  const { avatarFileName, formData } = await uploadAvatarIfExists(request);
  const data = await parseFormData({
    formData,
    schema: newCalendarEventActionSchema,
    parseAsync: true,
  });

  validate(canAddNewEvent(user), "Not authorized", 401);

  const startTimes = data.date.map((date) => dateToDatabaseTimestamp(date));
  const commonArgs = {
    authorId: user.id,
    name: data.name,
    description: data.description,
    rules: data.rules,
    startTimes,
    bracketUrl: data.bracketUrl,
    discordInviteCode: data.discordInviteCode,
    tags: data.tags
      ? data.tags
          .sort(
            (a, b) =>
              CALENDAR_EVENT.TAGS.indexOf(a as CalendarEventTag) -
              CALENDAR_EVENT.TAGS.indexOf(b as CalendarEventTag),
          )
          .join(",")
      : data.tags,
    badges: data.badges ?? [],
    // newly uploaded avatar
    avatarFileName,
    // reused avatar either via edit or template
    avatarImgId: data.avatarImgId ?? undefined,
    avatarMetadata:
      data.backgroundColor && data.textColor
        ? {
            backgroundColor: data.backgroundColor,
            textColor: data.textColor,
          }
        : undefined,
    autoValidateAvatar: Boolean(user.patronTier),
    toToolsEnabled: canCreateTournament(user) ? Number(data.toToolsEnabled) : 0,
    toToolsMode:
      rankedModesShort.find((mode) => mode === data.toToolsMode) ?? null,
    bracketProgression: formValuesToBracketProgression(data),
    teamsPerGroup: data.teamsPerGroup ?? undefined,
    thirdPlaceMatch: data.thirdPlaceMatch ?? undefined,
    isRanked: data.isRanked ?? undefined,
    isInvitational: data.isInvitational ?? false,
    deadlines: data.strictDeadline ? ("STRICT" as const) : ("DEFAULT" as const),
    enableNoScreenToggle: data.enableNoScreenToggle ?? undefined,
    requireInGameNames: data.requireInGameNames ?? undefined,
    autoCheckInAll: data.autoCheckInAll ?? undefined,
    autonomousSubs: data.autonomousSubs ?? undefined,
    swissGroupCount: data.swissGroupCount ?? undefined,
    swissRoundCount: data.swissRoundCount ?? undefined,
    tournamentToCopyId: data.tournamentToCopyId,
    regClosesAt: data.regClosesAt
      ? dateToDatabaseTimestamp(
          regClosesAtDate({
            startTime: databaseTimestampToDate(startTimes[0]),
            closesAt: data.regClosesAt,
          }),
        )
      : undefined,
  };
  validate(
    !commonArgs.toToolsEnabled || commonArgs.bracketProgression,
    "Bracket progression must be set for tournaments",
  );

  const deserializedMaps = (() => {
    if (!data.pool) return;

    return MapPool.toDbList(data.pool);
  })();

  if (data.eventToEditId) {
    const eventToEdit = badRequestIfFalsy(
      await CalendarRepository.findById({ id: data.eventToEditId }),
    );
    if (eventToEdit.tournamentId) {
      const tournament = await tournamentFromDB({
        tournamentId: eventToEdit.tournamentId,
        user,
      });
      validate(!tournament.hasStarted, "Tournament has already started", 400);
    }
    validate(
      canEditCalendarEvent({ user, event: eventToEdit }),
      "Not authorized",
      401,
    );

    await CalendarRepository.update({
      eventId: data.eventToEditId,
      mapPoolMaps: deserializedMaps,
      ...commonArgs,
    });

    throw redirect(calendarEventPage(data.eventToEditId));
  } else {
    const mapPickingStyle = () => {
      if (data.toToolsMode === "TO") return "TO" as const;
      if (data.toToolsMode) return `AUTO_${data.toToolsMode}` as const;

      return "AUTO_ALL" as const;
    };
    const createdEventId = await CalendarRepository.create({
      mapPoolMaps: deserializedMaps,
      isFullTournament: data.toToolsEnabled,
      mapPickingStyle: mapPickingStyle(),
      ...commonArgs,
    });

    throw redirect(calendarEventPage(createdEventId));
  }
};

async function uploadAvatarIfExists(request: Request) {
  const uploadHandler = composeUploadHandlers(
    s3UploadHandler(`tournament-logo-${nanoid()}-${Date.now()}`),
    createMemoryUploadHandler(),
  );

  try {
    const formData = await parseMultipartFormData(request, uploadHandler);
    const imgSrc = formData.get("img") as string | null;
    invariant(imgSrc);

    const urlParts = imgSrc.split("/");
    const fileName = urlParts[urlParts.length - 1];
    invariant(fileName);

    return {
      avatarFileName: fileName,
      formData,
    };
  } catch (err) {
    // user did not submit image
    if (err instanceof TypeError) {
      return {
        avatarFileName: undefined,
        formData: await request.formData(),
      };
    }

    throw err;
  }
}

export const newCalendarEventActionSchema = z
  .object({
    eventToEditId: z.preprocess(actualNumber, id.nullish()),
    tournamentToCopyId: z.preprocess(actualNumber, id.nullish()),
    name: z
      .string()
      .min(CALENDAR_EVENT.NAME_MIN_LENGTH)
      .max(CALENDAR_EVENT.NAME_MAX_LENGTH),
    description: z.preprocess(
      falsyToNull,
      z.string().max(CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH).nullable(),
    ),
    rules: z.preprocess(
      falsyToNull,
      z.string().max(CALENDAR_EVENT.RULES_MAX_LENGTH).nullable(),
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
    backgroundColor: hexCode.nullish(),
    textColor: hexCode.nullish(),
    avatarImgId: id.nullish(),
    pool: z.string().optional(),
    toToolsEnabled: z.preprocess(checkboxValueToBoolean, z.boolean()),
    toToolsMode: z.enum(["ALL", "TO", "SZ", "TC", "RM", "CB"]).optional(),
    isRanked: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
    regClosesAt: z.enum(REG_CLOSES_AT_OPTIONS).nullish(),
    enableNoScreenToggle: z.preprocess(
      checkboxValueToBoolean,
      z.boolean().nullish(),
    ),
    autonomousSubs: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
    strictDeadline: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
    isInvitational: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
    requireInGameNames: z.preprocess(
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
    swissGroupCount: z.coerce.number().int().positive().nullish(),
    swissRoundCount: z.coerce.number().int().positive().nullish(),
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
