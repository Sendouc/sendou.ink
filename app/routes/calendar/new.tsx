import type { SerializeFrom } from "@remix-run/node";
import {
  json,
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import { z } from "zod";
import type { AlertVariation } from "~/components/Alert";
import { Alert } from "~/components/Alert";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { DateInput } from "~/components/DateInput";
import { FormMessage } from "~/components/FormMessage";
import { TrashIcon } from "~/components/icons/Trash";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { MapPoolSelector } from "~/components/MapPoolSelector";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { Toggle } from "~/components/Toggle";
import { CALENDAR_EVENT } from "~/constants";
import { db } from "~/db";
import type { Badge as BadgeType, CalendarEventTag } from "~/db/types";
import { useIsMounted } from "~/hooks/useIsMounted";
import { requireUser, useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import { MapPool } from "~/modules/map-pool-serializer";
import { canEditCalendarEvent, canEnableTOTools } from "~/permissions";
import calendarNewStyles from "~/styles/calendar-new.css";
import mapsStyles from "~/styles/maps.css";
import {
  dateToDatabaseTimestamp,
  databaseTimestampToDate,
  getDateWithHoursOffset,
  getDateAtNextFullHour,
} from "~/utils/dates";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { calendarEventPage } from "~/utils/urls";
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
import { Tags } from "./components/Tags";
import { isDefined } from "~/utils/arrays";
import { CrossIcon } from "~/components/icons/Cross";

const MIN_DATE = new Date(Date.UTC(2015, 4, 28));

const MAX_DATE = new Date();
MAX_DATE.setFullYear(MAX_DATE.getFullYear() + 1);

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: calendarNewStyles },
    { rel: "stylesheet", href: mapsStyles },
  ];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  return {
    title: data.title,
  };
};

const newCalendarEventActionSchema = z.object({
  eventToEditId: z.preprocess(actualNumber, id.nullish()),
  name: z
    .string()
    .min(CALENDAR_EVENT.NAME_MIN_LENGTH)
    .max(CALENDAR_EVENT.NAME_MAX_LENGTH),
  description: z.preprocess(
    falsyToNull,
    z.string().max(CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH).nullable()
  ),
  date: z.preprocess(
    toArray,
    z
      .array(z.preprocess(date, z.date().min(MIN_DATE).max(MAX_DATE)))
      .min(1)
      .max(CALENDAR_EVENT.MAX_AMOUNT_OF_DATES)
  ),
  bracketUrl: z.string().url().max(CALENDAR_EVENT.BRACKET_URL_MAX_LENGTH),
  discordInviteCode: z.preprocess(
    falsyToNull,
    z.string().max(CALENDAR_EVENT.DISCORD_INVITE_CODE_MAX_LENGTH).nullable()
  ),
  tags: z.preprocess(
    processMany(safeJSONParse, removeDuplicates),
    z
      .array(
        z
          .string()
          .refine((val) =>
            CALENDAR_EVENT.TAGS.includes(val as CalendarEventTag)
          )
      )
      .nullable()
  ),
  badges: z.preprocess(
    processMany(safeJSONParse, removeDuplicates),
    z.array(id).nullable()
  ),
  pool: z.string().optional(),
  toToolsEnabled: z.preprocess(checkboxValueToBoolean, z.boolean()),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: newCalendarEventActionSchema,
  });

  const commonArgs = {
    name: data.name,
    description: data.description,
    startTimes: data.date.map((date) => dateToDatabaseTimestamp(date)),
    bracketUrl: data.bracketUrl,
    discordInviteCode: data.discordInviteCode,
    tags: data.tags
      ? data.tags
          .sort(
            (a, b) =>
              CALENDAR_EVENT.TAGS.indexOf(a as CalendarEventTag) -
              CALENDAR_EVENT.TAGS.indexOf(b as CalendarEventTag)
          )
          .join(",")
      : data.tags,
    badges: data.badges ?? [],
    toToolsEnabled: canEnableTOTools(user) ? Number(data.toToolsEnabled) : 0,
  };

  const deserializedMaps = (() => {
    if (!data.pool) return;

    return MapPool.toDbList(data.pool);
  })();

  if (data.eventToEditId) {
    const eventToEdit = badRequestIfFalsy(
      db.calendarEvents.findById(data.eventToEditId)
    );
    validate(canEditCalendarEvent({ user, event: eventToEdit }), 401);

    db.calendarEvents.update({
      eventId: data.eventToEditId,
      mapPoolMaps: deserializedMaps,
      ...commonArgs,
    });

    return redirect(calendarEventPage(data.eventToEditId));
  } else {
    const createdEventId = db.calendarEvents.create({
      authorId: user.id,
      mapPoolMaps: deserializedMaps,
      ...commonArgs,
    });

    return redirect(calendarEventPage(createdEventId));
  }
};

export const handle: SendouRouteHandle = {
  i18n: ["calendar", "game-misc"],
};

export const loader = async ({ request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const user = await requireUser(request);
  const url = new URL(request.url);

  const eventId = Number(url.searchParams.get("eventId"));
  const eventToEdit = Number.isNaN(eventId)
    ? undefined
    : db.calendarEvents.findById(eventId);

  const canEditEvent =
    eventToEdit && canEditCalendarEvent({ user, event: eventToEdit });

  return json({
    managedBadges: db.badges.managedByUserId(user.id),
    recentEventsWithMapPools: db.calendarEvents.findRecentMapPoolsByAuthorId(
      user.id
    ),
    eventToEdit: canEditEvent
      ? {
          ...eventToEdit,
          // "BADGE" tag is special and can't be edited like other tags
          tags: eventToEdit.tags.filter((tag) => tag !== "BADGE"),
          badges: db.calendarEvents.findBadgesByEventId(eventId),
          mapPool: db.calendarEvents.findMapPoolByEventId(eventId),
          tieBreakerMapPool:
            db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
        }
      : undefined,
    title: makeTitle([canEditEvent ? "Edit" : "New", t("pages.calendar")]),
  });
};

export default function CalendarNewEventPage() {
  const { t } = useTranslation();
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <Main className="calendar-new__container">
      <Form className="stack md items-start" method="post">
        {eventToEdit && (
          <input
            type="hidden"
            name="eventToEditId"
            value={eventToEdit.eventId}
          />
        )}
        <NameInput />
        <DescriptionTextarea />
        <DatesInput />
        <BracketUrlInput />
        <DiscordLinkInput />
        <TagsAdder />
        <BadgesAdder />
        <TOToolsAndMapPool />
        <Button type="submit" className="mt-4">
          {t("actions.submit")}
        </Button>
      </Form>
    </Main>
  );
}

function NameInput() {
  const { t } = useTranslation();
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="name" required>
        {t("forms.name")}
      </Label>
      <input
        name="name"
        required
        minLength={CALENDAR_EVENT.NAME_MIN_LENGTH}
        maxLength={CALENDAR_EVENT.NAME_MAX_LENGTH}
        defaultValue={eventToEdit?.name}
      />
    </div>
  );
}

function DescriptionTextarea() {
  const { t } = useTranslation();
  const { eventToEdit } = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(eventToEdit?.description ?? "");

  return (
    <div>
      <Label
        htmlFor="description"
        valueLimits={{
          current: value.length,
          max: CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH,
        }}
      >
        {t("forms.description")}
      </Label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH}
      />
    </div>
  );
}

function AddButton({ onAdd, id }: { onAdd: () => void; id?: string }) {
  const { t } = useTranslation();

  return (
    <Button tiny variant="outlined" onClick={onAdd} id={id}>
      {t("actions.add")}
    </Button>
  );
}

function DatesInput() {
  const { t } = useTranslation(["common", "calendar"]);
  const { eventToEdit } = useLoaderData<typeof loader>();

  // Using array index as a key can mess up internal state, especially when
  // removing elements from the middle. So we just count up for every date we
  // create.
  const keyCounter = React.useRef(0);
  const getKey = () => ++keyCounter.current;

  // React hook that keeps track of child DateInput's dates
  // (necessary for determining additional Date's defaultValues)
  const [datesInputState, setDatesInputState] = React.useState<
    Array<{
      key: number;
      date: Date | null;
    }>
  >(() => {
    // Initialize datesInputState by retrieving pre-existing events if they exist
    if (eventToEdit?.startTimes) {
      return eventToEdit.startTimes.map((t) => ({
        key: getKey(),
        date: databaseTimestampToDate(t),
      }));
    }

    // Initial date rounded to next full hour from now
    return [{ key: getKey(), date: getDateAtNextFullHour(new Date()) }];
  });

  const datesCount = datesInputState.length;

  const isMounted = useIsMounted();
  const usersTimeZone = isMounted
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "";
  const NEW_CALENDAR_EVENT_HOURS_OFFSET = 24;

  const addDate = () =>
    setDatesInputState((current) => {
      // .reverse() is mutating, but map/filter returns a new array anyway.
      const lastValidDate = current
        .map((e) => e.date)
        .filter(isDefined)
        .reverse()[0];

      const addedDate = lastValidDate
        ? getDateWithHoursOffset(lastValidDate, NEW_CALENDAR_EVENT_HOURS_OFFSET)
        : getDateAtNextFullHour(new Date());

      return [...current, { key: getKey(), date: addedDate }];
    });

  return (
    <div className="stack md items-start">
      <fieldset>
        <legend>
          {t("calendar:forms.dates")} <span className="text-error">*</span>
        </legend>
        <div className="stack sm items-start">
          <div className="stack sm">
            {datesInputState.map(({ date, key }, i) => {
              return (
                <div key={key} className="stack horizontal sm items-center">
                  <label
                    id={`date-input-${key}-label`}
                    className="calendar-new__day-label"
                    htmlFor={`date-input-${key}`}
                  >
                    {t("calendar:day", {
                      number: i + 1,
                    })}
                  </label>
                  <DateInput
                    id={`date-input-${key}`}
                    name="date"
                    defaultValue={date ?? undefined}
                    min={MIN_DATE}
                    max={MAX_DATE}
                    required
                    onChange={(newDate: Date | null) => {
                      setDatesInputState((current) =>
                        current.map((entry) =>
                          entry.key === key
                            ? { ...entry, date: newDate }
                            : entry
                        )
                      );
                    }}
                  />
                  {/* "Remove" button */}
                  {datesCount > 1 && (
                    <Button
                      tiny
                      onClick={() => {
                        setDatesInputState((current) =>
                          current.filter((e) => e.key !== key)
                        );
                      }}
                      aria-controls={`date-input-${key}`}
                      aria-label={t("common:actions.remove")}
                      aria-describedby={`date-input-${key}-label`}
                      title={t("common:actions.remove")}
                      icon={<CrossIcon />}
                      variant="minimal-destructive"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {datesCount < CALENDAR_EVENT.MAX_AMOUNT_OF_DATES && (
            <AddButton onAdd={addDate} />
          )}
          <FormMessage type="info" className={clsx({ invisible: !isMounted })}>
            {t("calendar:inYourTimeZone")} {usersTimeZone}
          </FormMessage>
        </div>
      </fieldset>
    </div>
  );
}

function BracketUrlInput() {
  const { t } = useTranslation("calendar");
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="bracketUrl" required>
        {t("forms.bracketUrl")}
      </Label>
      <input
        name="bracketUrl"
        type="url"
        required
        maxLength={CALENDAR_EVENT.BRACKET_URL_MAX_LENGTH}
        defaultValue={eventToEdit?.bracketUrl}
      />
    </div>
  );
}

function DiscordLinkInput() {
  const { t } = useTranslation("calendar");
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <div className="stack items-start">
      <Label htmlFor="discordInviteCode">{t("forms.discordInvite")}</Label>
      <Input
        name="discordInviteCode"
        leftAddon="https://discord.gg/"
        maxLength={CALENDAR_EVENT.DISCORD_INVITE_CODE_MAX_LENGTH}
        defaultValue={eventToEdit?.discordInviteCode ?? undefined}
      />
    </div>
  );
}

function TagsAdder() {
  const { t } = useTranslation(["common", "calendar"]);
  const { eventToEdit } = useLoaderData<typeof loader>();
  const [tags, setTags] = React.useState(
    (eventToEdit?.tags ?? []) as Array<CalendarEventTag>
  );
  const id = React.useId();

  const tagsForSelect = CALENDAR_EVENT.TAGS.filter(
    (tag) => !tags.includes(tag) && tag !== "BADGE"
  );

  return (
    <div className="stack sm">
      <input
        type="hidden"
        name="tags"
        value={JSON.stringify(tags.length > 0 ? tags : null)}
      />
      <div>
        <label htmlFor={id}>{t("calendar:forms.tags")}</label>
        <select
          id={id}
          className="calendar-new__select"
          onChange={(e) =>
            setTags([...tags, e.target.value as CalendarEventTag])
          }
        >
          <option value="">{t("calendar:forms.tags.placeholder")}</option>
          {tagsForSelect.map((tag) => (
            <option key={tag} value={tag}>
              {t(`common:tag.name.${tag}`)}
            </option>
          ))}
        </select>
        <FormMessage type="info">{t("calendar:forms.tags.info")}</FormMessage>
      </div>
      <Tags
        tags={tags}
        onDelete={(tagToDelete) =>
          setTags(tags.filter((tag) => tag !== tagToDelete))
        }
      />
    </div>
  );
}

function BadgesAdder() {
  const { t } = useTranslation("calendar");
  const { eventToEdit } = useLoaderData<typeof loader>();
  const { managedBadges } = useLoaderData<typeof loader>();
  const [badges, setBadges] = React.useState(eventToEdit?.badges ?? []);
  const id = React.useId();

  const input = (
    <input
      type="hidden"
      name="badges"
      value={JSON.stringify(badges.length > 0 ? badges.map((b) => b.id) : null)}
    />
  );

  if (managedBadges.length === 0) return input;

  const handleBadgeDelete = (badgeId: BadgeType["id"]) => {
    setBadges(badges.filter((badge) => badge.id !== badgeId));
  };

  const badgesForSelect = managedBadges.filter(
    (badge) => !badges.some((b) => b.id === badge.id)
  );

  return (
    <div className="stack md">
      {input}
      <div>
        <label htmlFor={id}>{t("forms.badges")}</label>
        <select
          id={id}
          className="calendar-new__select"
          onChange={(e) => {
            setBadges([
              ...badges,
              managedBadges.find(
                (badge) => badge.id === Number(e.target.value)
              )!,
            ]);
          }}
        >
          <option value="">{t("forms.badges.placeholder")}</option>
          {badgesForSelect.map((badge) => (
            <option key={badge.id} value={badge.id}>
              {badge.displayName}
            </option>
          ))}
        </select>
      </div>
      {badges.length > 0 && (
        <div className="calendar-new__badges">
          {badges.map((badge) => (
            <div className="stack horizontal md items-center" key={badge.id}>
              <Badge badge={badge} isAnimated size={32} />
              <span>{badge.displayName}</span>
              <Button
                className="ml-auto"
                onClick={() => handleBadgeDelete(badge.id)}
                icon={<TrashIcon />}
                variant="minimal-destructive"
                aria-label="Remove badge"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TOToolsAndMapPool() {
  const user = useUser();
  const { eventToEdit } = useLoaderData<typeof loader>();
  const [checked, setChecked] = React.useState(
    Boolean(eventToEdit?.toToolsEnabled)
  );

  return (
    <>
      {canEnableTOTools(user) && (
        <TOToolsEnabler checked={checked} setChecked={setChecked} />
      )}
      {checked ? <CounterPickMapPoolSection /> : <MapPoolSection />}
    </>
  );
}

function TOToolsEnabler({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) {
  const { t } = useTranslation(["calendar"]);
  const id = React.useId();

  return (
    <div>
      <label htmlFor={id}>{t("calendar:forms.toTools.header")}</label>
      <Toggle
        name="toToolsEnabled"
        id={id}
        tiny
        checked={checked}
        setChecked={setChecked}
      />
      <FormMessage type="info">
        {t("calendar:forms.toTools.explanation")}
      </FormMessage>
    </div>
  );
}

function MapPoolSection() {
  const { t } = useTranslation(["game-misc", "common"]);

  const { eventToEdit, recentEventsWithMapPools } =
    useLoaderData<typeof loader>();
  const [mapPool, setMapPool] = React.useState<MapPool>(
    eventToEdit?.mapPool ? new MapPool(eventToEdit.mapPool) : MapPool.EMPTY
  );
  const [includeMapPool, setIncludeMapPool] = React.useState(
    Boolean(eventToEdit?.mapPool)
  );

  const id = React.useId();

  return includeMapPool ? (
    <>
      <input type="hidden" name="pool" value={mapPool.serialized} />

      <MapPoolSelector
        className="w-full"
        mapPool={mapPool}
        handleRemoval={() => setIncludeMapPool(false)}
        handleMapPoolChange={setMapPool}
        recentEvents={recentEventsWithMapPools}
      />
    </>
  ) : (
    <div>
      <label htmlFor={id}>{t("common:maps.mapPool")}</label>
      <AddButton onAdd={() => setIncludeMapPool(true)} id={id} />
    </div>
  );
}

function CounterPickMapPoolSection() {
  const { t } = useTranslation(["common"]);
  const { eventToEdit } = useLoaderData<typeof loader>();
  const [mapPool, setMapPool] = React.useState<MapPool>(
    eventToEdit?.tieBreakerMapPool
      ? new MapPool(eventToEdit.tieBreakerMapPool)
      : MapPool.EMPTY
  );

  return (
    <>
      <RequiredHiddenInput
        value={mapPool.serialized}
        name="pool"
        isValid={validateTiebreakerMapPool(mapPool) === "VALID"}
      />

      <MapPoolSelector
        className="w-full"
        mapPool={mapPool}
        handleMapPoolChange={setMapPool}
        title={t("common:maps.tieBreakerMapPool")}
        modesToInclude={["SZ", "TC", "RM", "CB"]}
        info={
          <div>
            <MapPoolValidationStatusMessage
              status={validateTiebreakerMapPool(mapPool)}
            />
          </div>
        }
      />
    </>
  );
}

type CounterPickValidationStatus =
  | "PICKING"
  | "VALID"
  | "NOT_ONE_MAP_PER_MODE"
  | "MAP_REPEATED"
  | "MODE_REPEATED";

function validateTiebreakerMapPool(
  mapPool: MapPool
): CounterPickValidationStatus {
  if (mapPool.stages.length !== new Set(mapPool.stages).size) {
    return "MAP_REPEATED";
  }
  if (
    mapPool.parsed.SZ.length > 1 ||
    mapPool.parsed.TC.length > 1 ||
    mapPool.parsed.RM.length > 1 ||
    mapPool.parsed.CB.length > 1
  ) {
    return "MODE_REPEATED";
  }
  if (
    mapPool.parsed.SZ.length < 1 ||
    mapPool.parsed.TC.length < 1 ||
    mapPool.parsed.RM.length < 1 ||
    mapPool.parsed.CB.length < 1
  ) {
    return "PICKING";
  }

  return "VALID";
}

function MapPoolValidationStatusMessage({
  status,
}: {
  status: CounterPickValidationStatus;
}) {
  const { t } = useTranslation(["common"]);

  const alertVariation: AlertVariation =
    status === "VALID" ? "SUCCESS" : status === "PICKING" ? "INFO" : "WARNING";

  return (
    <div>
      <Alert alertClassName="w-max" variation={alertVariation} tiny>
        {t(`common:maps.validation.${status}`)}
      </Alert>
    </div>
  );
}
