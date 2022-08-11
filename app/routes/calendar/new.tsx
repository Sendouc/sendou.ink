import { Form, useLoaderData } from "@remix-run/react";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import * as React from "react";
import type { Badge as BadgeType, CalendarEventTag } from "~/db/types";
import { CALENDAR_EVENT } from "~/constants";
import { Button } from "~/components/Button";
import {
  json,
  redirect,
  type MetaFunction,
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import styles from "~/styles/calendar-new.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { TrashIcon } from "~/components/icons/Trash";
import { Input } from "~/components/Input";
import { FormMessage } from "~/components/FormMessage";
import { useIsMounted } from "~/hooks/useIsMounted";
import { Tags } from "./components/Tags";
import { db } from "~/db";
import { requireUser } from "~/modules/auth";
import { Badge } from "~/components/Badge";
import { z } from "zod";
import {
  actualNumber,
  date,
  falsyToNull,
  id,
  processMany,
  removeDuplicates,
  safeJSONParse,
  toArray,
} from "~/utils/zod";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  validate,
} from "~/utils/remix";
import {
  databaseTimestampToDate,
  dateToDatabaseTimestamp,
} from "~/utils/dates";
import { calendarEventPage } from "~/utils/urls";
import { makeTitle } from "~/utils/strings";
import { i18next } from "~/modules/i18n";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import { canEditCalendarEvent } from "~/permissions";
import { DateInput } from "~/components/DateInput";

const MIN_DATE = new Date(Date.UTC(2015, 4, 28));

const MAX_DATE = new Date();
MAX_DATE.setFullYear(MAX_DATE.getFullYear() + 1);

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as Nullable<UseDataFunctionReturn<typeof loader>>;

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
  };
  if (data.eventToEditId) {
    const eventToEdit = badRequestIfFalsy(
      db.calendarEvents.findById(data.eventToEditId)
    );
    validate(canEditCalendarEvent({ user, event: eventToEdit }), 401);

    db.calendarEvents.update({
      eventId: data.eventToEditId,
      ...commonArgs,
    });

    return redirect(calendarEventPage(data.eventToEditId));
  } else {
    const createdEventId = db.calendarEvents.create({
      authorId: user.id,
      ...commonArgs,
    });

    return redirect(calendarEventPage(createdEventId));
  }
};

export const handle = {
  i18n: "calendar",
};

export const loader = async ({ request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const user = await requireUser(request);
  const url = new URL(request.url);

  const eventId = Number(url.searchParams.get("eventId"));
  const eventToEdit = Number.isNaN(eventId)
    ? undefined
    : db.calendarEvents.findById(eventId);

  const canEditEvent = eventToEdit?.authorId === user.id;

  return json({
    managedBadges: db.badges.managedByUserId(user.id),
    eventToEdit: canEditEvent
      ? {
          ...eventToEdit,
          // "BADGE" tag is special and can't be edited like other tags
          tags: eventToEdit.tags.filter((tag) => tag !== "BADGE"),
          badges: db.calendarEvents.findBadgesById(eventId),
        }
      : undefined,
    title: makeTitle([canEditEvent ? "Edit" : "New", t("pages.calendar")]),
  });
};

export default function CalendarNewEventPage() {
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <Main halfWidth>
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
        <Button type="submit" className="mt-4" data-cy="submit-button">
          Submit
        </Button>
      </Form>
    </Main>
  );
}

function NameInput() {
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="name" required>
        Name
      </Label>
      <input
        name="name"
        required
        minLength={CALENDAR_EVENT.NAME_MIN_LENGTH}
        maxLength={CALENDAR_EVENT.NAME_MAX_LENGTH}
        defaultValue={eventToEdit?.name}
        data-cy="name-input"
      />
    </div>
  );
}

function DescriptionTextarea() {
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
        Description
      </Label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH}
        data-cy="description-textarea"
      />
    </div>
  );
}

function DatesInput() {
  const { eventToEdit } = useLoaderData<typeof loader>();
  const [datesCount, setDatesCount] = React.useState(
    eventToEdit?.startTimes.length ?? 1
  );
  const isMounted = useIsMounted();

  const usersTimeZone = isMounted
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "";

  return (
    <div className="stack md items-start">
      <div>
        <Label htmlFor="date" required>
          Dates
        </Label>
        <div className="stack sm">
          {new Array(datesCount).fill(null).map((_, i) => {
            const defaultStartTime = eventToEdit?.startTimes[i];

            return (
              <div key={i} className="stack horizontal sm items-center">
                <DateInput
                  id="date"
                  name="date"
                  defaultValue={
                    defaultStartTime
                      ? databaseTimestampToDate(defaultStartTime)
                      : undefined
                  }
                  min={MIN_DATE}
                  max={MAX_DATE}
                  data-cy="date-input"
                  required
                />
                {i === datesCount - 1 && (
                  <>
                    <Button
                      tiny
                      disabled={
                        datesCount === CALENDAR_EVENT.MAX_AMOUNT_OF_DATES
                      }
                      onClick={() => setDatesCount((count) => count + 1)}
                      data-cy="add-date-button"
                    >
                      Add
                    </Button>
                    {datesCount > 1 && (
                      <Button
                        tiny
                        onClick={() => setDatesCount((count) => count - 1)}
                        data-cy="remove-date-button"
                        variant="destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <FormMessage type="info" className={clsx({ invisible: !isMounted })}>
          Times in your local time zone: {usersTimeZone}
        </FormMessage>
      </div>
    </div>
  );
}

function BracketUrlInput() {
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="bracketUrl" required>
        Bracket URL
      </Label>
      <input
        name="bracketUrl"
        type="url"
        required
        maxLength={CALENDAR_EVENT.BRACKET_URL_MAX_LENGTH}
        defaultValue={eventToEdit?.bracketUrl}
        data-cy="bracket-url-input"
      />
    </div>
  );
}

function DiscordLinkInput() {
  const { eventToEdit } = useLoaderData<typeof loader>();

  return (
    <div className="stack items-start">
      <Label htmlFor="discordInviteCode">Discord server invite URL</Label>
      <Input
        name="discordInviteCode"
        leftAddon="https://discord.gg/"
        maxLength={CALENDAR_EVENT.DISCORD_INVITE_CODE_MAX_LENGTH}
        defaultValue={eventToEdit?.discordInviteCode ?? undefined}
        data-cy="discord-invite-code-input"
      />
    </div>
  );
}

function TagsAdder() {
  const { eventToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation("calendar");
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
        <label htmlFor={id}>Tags</label>
        <select
          id={id}
          className="calendar-new__select"
          onChange={(e) =>
            setTags([...tags, e.target.value as CalendarEventTag])
          }
          data-cy="tags-select"
        >
          <option value="">Choose a tag</option>
          {tagsForSelect.map((tag) => (
            <option key={tag} value={tag}>
              {t(`tag.name.${tag}`)}
            </option>
          ))}
        </select>
        <FormMessage type="info">
          &quot;Badge prizes&quot; tag is added automatically if applicable
        </FormMessage>
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
        <label htmlFor={id}>Badge prizes</label>
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
          data-cy="badges-select"
        >
          <option value="">Choose a badge prize</option>
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
                data-cy="badge-delete-button"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
