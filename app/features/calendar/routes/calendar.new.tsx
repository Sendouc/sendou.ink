import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import type { AlertVariation } from "~/components/Alert";
import { Alert } from "~/components/Alert";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { DateInput } from "~/components/DateInput";
import { Divider } from "~/components/Divider";
import { FormMessage } from "~/components/FormMessage";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { MapPoolSelector } from "~/components/MapPoolSelector";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { SubmitButton } from "~/components/SubmitButton";
import { Toggle } from "~/components/Toggle";
import { CrossIcon } from "~/components/icons/Cross";
import { TrashIcon } from "~/components/icons/Trash";
import { CALENDAR_EVENT } from "~/constants";
import type { Tables } from "~/db/tables";
import type { Badge as BadgeType, CalendarEventTag } from "~/db/types";
import { requireUser } from "~/features/auth/core/user.server";
import * as BadgeRepository from "~/features/badges/BadgeRepository.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { tournamentFromDB } from "~/features/tournament-bracket/core/Tournament.server";
import {
  BRACKET_NAMES,
  type TournamentFormatShort,
} from "~/features/tournament/tournament-constants";
import { useIsMounted } from "~/hooks/useIsMounted";
import { i18next } from "~/modules/i18n/i18next.server";
import type { RankedModeShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { canEditCalendarEvent } from "~/permissions";
import { isDefined, nullFilledArray } from "~/utils/arrays";
import {
  databaseTimestampToDate,
  dateToDatabaseTimestamp,
  getDateAtNextFullHour,
  getDateWithHoursOffset,
} from "~/utils/dates";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { makeTitle, pathnameFromPotentialURL } from "~/utils/strings";
import { calendarEventPage, tournamentBracketsPage } from "~/utils/urls";
import { newCalendarEventActionSchema } from "../calendar-schemas.server";
import {
  bracketProgressionToShortTournamentFormat,
  calendarEventMaxDate,
  calendarEventMinDate,
  canAddNewEvent,
  datesToRegClosesAt,
  regClosesAtDate,
  regClosesAtToDisplayName,
  validateFollowUpBrackets,
} from "../calendar-utils";
import {
  canCreateTournament,
  formValuesToBracketProgression,
} from "../calendar-utils.server";
import { Tags } from "../components/Tags";
import { Placement } from "~/components/Placement";
import type { FollowUpBracket } from "../calendar-types";
import {
  REG_CLOSES_AT_OPTIONS,
  type RegClosesAtOption,
} from "../calendar-constants";

import "~/styles/calendar-new.css";
import "~/styles/maps.css";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return [];

  return [{ title: data.title }];
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: newCalendarEventActionSchema,
    parseAsync: true,
  });

  validate(canAddNewEvent(user), "Not authorized", 401);

  const startTimes = data.date.map((date) => dateToDatabaseTimestamp(date));
  const commonArgs = {
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
    toToolsEnabled: canCreateTournament(user) ? Number(data.toToolsEnabled) : 0,
    toToolsMode:
      rankedModesShort.find((mode) => mode === data.toToolsMode) ?? null,
    bracketProgression: formValuesToBracketProgression(data),
    teamsPerGroup: data.teamsPerGroup ?? undefined,
    thirdPlaceMatch: data.thirdPlaceMatch ?? undefined,
    isRanked: data.isRanked ?? undefined,
    enableNoScreenToggle: data.enableNoScreenToggle ?? undefined,
    autoCheckInAll: data.autoCheckInAll ?? undefined,
    autonomousSubs: data.autonomousSubs ?? undefined,
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
      authorId: user.id,
      mapPoolMaps: deserializedMaps,
      isFullTournament: data.toToolsEnabled,
      mapPickingStyle: mapPickingStyle(),
      ...commonArgs,
    });

    throw redirect(calendarEventPage(createdEventId));
  }
};

export const handle: SendouRouteHandle = {
  i18n: ["calendar", "game-misc"],
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request);
  const user = await requireUser(request);
  const url = new URL(request.url);

  validate(canAddNewEvent(user), "Not authorized", 401);

  const eventWithTournament = async (key: string) => {
    const eventId = Number(url.searchParams.get(key));
    const event = Number.isNaN(eventId)
      ? undefined
      : await CalendarRepository.findById({
          id: eventId,
          includeMapPool: true,
          includeTieBreakerMapPool: true,
          includeBadgePrizes: true,
        });

    if (!event) return;

    // special tags that are added automatically
    const tags = event?.tags?.filter(
      (tag) => tag !== "BADGE" && tag !== "FULL_TOURNAMENT",
    );

    if (!event?.tournamentId) return { ...event, tags, tournamentCtx: null };

    return {
      ...event,
      tags,
      tournamentCtx: (
        await tournamentFromDB({
          tournamentId: event.tournamentId,
          user,
        })
      ).ctx,
    };
  };

  const eventToEdit = await eventWithTournament("eventId");
  const canEditEvent =
    eventToEdit && canEditCalendarEvent({ user, event: eventToEdit });

  // no editing tournament after the start
  if (
    eventToEdit &&
    eventToEdit.tournamentCtx?.inProgressBrackets &&
    eventToEdit.tournamentCtx.inProgressBrackets.length > 0
  ) {
    return redirect(
      tournamentBracketsPage({ tournamentId: eventToEdit.tournamentCtx.id }),
    );
  }

  const userCanCreateTournament = canCreateTournament(user);

  return json({
    managedBadges: await BadgeRepository.findManagedByUserId(user.id),
    recentEventsWithMapPools:
      await CalendarRepository.findRecentMapPoolsByAuthorId(user.id),
    eventToEdit: canEditEvent ? eventToEdit : undefined,
    eventToCopy:
      userCanCreateTournament && !eventToEdit
        ? await eventWithTournament("copyEventId")
        : undefined,
    recentTournaments:
      userCanCreateTournament && !eventToEdit
        ? await CalendarRepository.findRecentTournamentsByAuthorId(user.id)
        : undefined,
    title: makeTitle([canEditEvent ? "Edit" : "New", t("pages.calendar")]),
    canCreateTournament: userCanCreateTournament,
  });
};

const useBaseEvent = () => {
  const { eventToEdit, eventToCopy } = useLoaderData<typeof loader>();

  return eventToCopy ?? eventToEdit;
};

export default function CalendarNewEventPage() {
  const baseEvent = useBaseEvent();

  return (
    <Main className="calendar-new__container">
      <div className="stack md">
        <TemplateTournamentForm />
        <EventForm key={baseEvent?.eventId} />
      </div>
    </Main>
  );
}

function TemplateTournamentForm() {
  const { recentTournaments } = useLoaderData<typeof loader>();
  const [eventId, setEventId] = React.useState("");

  if (!recentTournaments) return null;

  return (
    <>
      <div>
        <Form className="stack horizontal sm">
          <select
            className="w-max"
            name="copyEventId"
            onChange={(event) => {
              setEventId(event.target.value);
            }}
          >
            <option value="">Select a template</option>
            {recentTournaments.map((event) => (
              <option key={event.id} value={event.id} suppressHydrationWarning>
                {event.name} (
                {databaseTimestampToDate(event.startTime).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )}
                )
              </option>
            ))}
          </select>
          <SubmitButton disabled={!eventId}>Use template</SubmitButton>
        </Form>
      </div>
      <hr />
    </>
  );
}

function EventForm() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { eventToEdit, eventToCopy } = useLoaderData<typeof loader>();
  const baseEvent = useBaseEvent();
  const [isTournament, setIsTournament] = React.useState(
    Boolean(baseEvent?.tournamentId),
  );

  return (
    <Form className="stack md items-start" method="post">
      {eventToEdit && (
        <input type="hidden" name="eventToEditId" value={eventToEdit.eventId} />
      )}
      {eventToCopy?.tournamentId ? (
        <input
          type="hidden"
          name="tournamentToCopyId"
          value={eventToCopy.tournamentId}
        />
      ) : null}
      {data.canCreateTournament && !eventToEdit && (
        <TournamentEnabler
          checked={isTournament}
          setChecked={setIsTournament}
        />
      )}
      <NameInput />
      <DescriptionTextarea supportsMarkdown={isTournament} />
      {isTournament ? <RulesTextarea supportsMarkdown /> : null}
      <DatesInput allowMultiDate={!isTournament} />
      {!isTournament ? <BracketUrlInput /> : null}
      <DiscordLinkInput />
      <TagsAdder />
      <BadgesAdder />
      {isTournament ? (
        <>
          <Divider>Tournament settings</Divider>
          <RegClosesAtSelect />
          <RankedToggle />
          <EnableNoScreenToggle />
          <AutonomousSubsToggle />
        </>
      ) : null}
      {isTournament ? <TournamentMapPickingStyleSelect /> : <MapPoolSection />}
      {isTournament ? <TournamentFormatSelector /> : null}
      <SubmitButton className="mt-4">{t("actions.submit")}</SubmitButton>
    </Form>
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

function DescriptionTextarea({
  supportsMarkdown,
}: {
  supportsMarkdown?: boolean;
}) {
  const { t } = useTranslation();
  const baseEvent = useBaseEvent();
  const [value, setValue] = React.useState(baseEvent?.description ?? "");

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
      {supportsMarkdown ? (
        <FormMessage type="info">Supports Markdown</FormMessage>
      ) : null}
    </div>
  );
}

function RulesTextarea({ supportsMarkdown }: { supportsMarkdown?: boolean }) {
  const baseEvent = useBaseEvent();
  const [value, setValue] = React.useState(
    baseEvent?.tournamentCtx?.rules ?? "",
  );

  return (
    <div>
      <Label
        htmlFor="rules"
        valueLimits={{
          current: value.length,
          max: CALENDAR_EVENT.RULES_MAX_LENGTH,
        }}
      >
        Rules
      </Label>
      <textarea
        id="rules"
        name="rules"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={CALENDAR_EVENT.RULES_MAX_LENGTH}
      />
      {supportsMarkdown ? (
        <FormMessage type="info">Supports Markdown</FormMessage>
      ) : null}
    </div>
  );
}

function AddButton({ onAdd, id }: { onAdd: () => void; id?: string }) {
  const { t } = useTranslation();

  return (
    <Button size="tiny" variant="outlined" onClick={onAdd} id={id}>
      {t("actions.add")}
    </Button>
  );
}

function DatesInput({ allowMultiDate }: { allowMultiDate?: boolean }) {
  const { t } = useTranslation(["common", "calendar"]);
  const { eventToEdit } = useLoaderData<typeof loader>();

  // Using array index as a key can mess up internal state, especially when
  // removing elements from the middle. So we just count up for every date we
  // create.
  const keyCounter = React.useRef(0);
  const getKey = () => ++keyCounter.current;

  // React hook that keeps track of child DateInput's dates
  // (necessary for determining additional Date's defaultValues)
  const [_datesInputState, setDatesInputState] = React.useState<
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

  const datesInputState = allowMultiDate
    ? _datesInputState
    : _datesInputState.filter((_, i) => i === 0);

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
                    suppressHydrationWarning
                    defaultValue={eventToEdit && date ? date : undefined}
                    min={calendarEventMinDate()}
                    max={calendarEventMaxDate()}
                    required
                    onChange={(newDate: Date | null) => {
                      setDatesInputState((current) =>
                        current.map((entry) =>
                          entry.key === key
                            ? { ...entry, date: newDate }
                            : entry,
                        ),
                      );
                    }}
                  />
                  {/* "Remove" button */}
                  {datesCount > 1 && (
                    <Button
                      size="tiny"
                      onClick={() => {
                        setDatesInputState((current) =>
                          current.filter((e) => e.key !== key),
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
          {datesCount < CALENDAR_EVENT.MAX_AMOUNT_OF_DATES &&
            allowMultiDate && <AddButton onAdd={addDate} />}
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
  const baseEvent = useBaseEvent();
  const [value, setValue] = React.useState(baseEvent?.discordInviteCode ?? "");

  return (
    <div className="stack items-start">
      <Label htmlFor="discordInviteCode">{t("forms.discordInvite")}</Label>
      <Input
        name="discordInviteCode"
        leftAddon="https://discord.gg/"
        maxLength={CALENDAR_EVENT.DISCORD_INVITE_CODE_MAX_LENGTH}
        value={value}
        onChange={(e) => setValue(pathnameFromPotentialURL(e.target.value))}
      />
    </div>
  );
}

function TagsAdder() {
  const { t } = useTranslation(["common", "calendar"]);
  const baseEvent = useBaseEvent();
  const [tags, setTags] = React.useState(baseEvent?.tags ?? []);
  const id = React.useId();

  const tagsForSelect = CALENDAR_EVENT.TAGS.filter(
    (tag) =>
      !tags.includes(tag) && tag !== "BADGE" && tag !== "FULL_TOURNAMENT",
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
  const baseEvent = useBaseEvent();
  const { managedBadges } = useLoaderData<typeof loader>();
  const [badges, setBadges] = React.useState(baseEvent?.badgePrizes ?? []);
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
    (badge) => !badges.some((b) => b.id === badge.id),
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
                (badge) => badge.id === Number(e.target.value),
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

function RankedToggle() {
  const baseEvent = useBaseEvent();
  const [isRanked, setIsRanked] = React.useState(
    baseEvent?.tournamentCtx?.settings.isRanked ?? true,
  );
  const id = React.useId();

  return (
    <div>
      <label htmlFor={id} className="w-max">
        Ranked
      </label>
      <Toggle
        name="isRanked"
        id={id}
        tiny
        checked={isRanked}
        setChecked={setIsRanked}
      />
      <FormMessage type="info">
        Ranked tournaments affect SP. Tournaments that don&apos;t have open
        registration (skill capped) or &quot;gimmick tournaments&quot; must
        always be hosted as unranked. Any tournament hosted during off-season is
        always unranked no matter what is chosen here.
      </FormMessage>
    </div>
  );
}

function EnableNoScreenToggle() {
  const baseEvent = useBaseEvent();
  const [enableNoScreen, setEnableNoScreen] = React.useState(
    baseEvent?.tournamentCtx?.settings.enableNoScreenToggle ?? true,
  );
  const id = React.useId();

  return (
    <div>
      <label htmlFor={id} className="w-max">
        Splattercolor Screen toggle
      </label>
      <Toggle
        name="enableNoScreenToggle"
        id={id}
        tiny
        checked={enableNoScreen}
        setChecked={setEnableNoScreen}
      />
      <FormMessage type="info">
        When registering ask teams if they want to play without Splattercolor
        Screen.
      </FormMessage>
    </div>
  );
}

function AutonomousSubsToggle() {
  const baseEvent = useBaseEvent();
  const [autonomousSubs, setAutonomousSubs] = React.useState(
    baseEvent?.tournamentCtx?.settings.autonomousSubs ?? true,
  );
  const id = React.useId();

  return (
    <div>
      <label htmlFor={id} className="w-max">
        Autonomous subs
      </label>
      <Toggle
        name="autonomousSubs"
        id={id}
        tiny
        checked={autonomousSubs}
        setChecked={setAutonomousSubs}
      />
      <FormMessage type="info">
        If enabled teams can add subs on their own while the tournament is in
        progress. When disabled needs to be done by the TO&apos;s.
      </FormMessage>
    </div>
  );
}

function RegClosesAtSelect() {
  const baseEvent = useBaseEvent();
  const [regClosesAt, setRegClosesAt] = React.useState<RegClosesAtOption>(
    baseEvent?.tournamentCtx?.settings.regClosesAt
      ? datesToRegClosesAt({
          startTime: new Date(baseEvent.tournamentCtx.startTime),
          regClosesAt: databaseTimestampToDate(
            baseEvent.tournamentCtx.settings.regClosesAt,
          ),
        })
      : "0",
  );
  const id = React.useId();

  return (
    <div>
      <label htmlFor={id} className="w-max">
        Registration closes at
      </label>
      <select
        name="regClosesAt"
        value={regClosesAt}
        onChange={(e) => setRegClosesAt(e.target.value as RegClosesAtOption)}
        className="w-max"
      >
        {REG_CLOSES_AT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {regClosesAtToDisplayName(option)}
          </option>
        ))}
      </select>
      <FormMessage type="info">
        All times relative to the reported tournament start time e.g. &quot;30
        minutes&quot; means &quot;30 minutes before event start time&quot;.
        After registration closes only TO&apos;s can make changes to team
        rosters.
      </FormMessage>
    </div>
  );
}

const mapPickingStyleToShort: Record<
  Tables["Tournament"]["mapPickingStyle"],
  "ALL" | "TO" | RankedModeShort
> = {
  TO: "TO",
  AUTO_ALL: "ALL",
  AUTO_SZ: "SZ",
  AUTO_TC: "TC",
  AUTO_RM: "RM",
  AUTO_CB: "CB",
};
function TournamentMapPickingStyleSelect() {
  const { t } = useTranslation(["common"]);
  const id = React.useId();
  const { eventToEdit, recentEventsWithMapPools } =
    useLoaderData<typeof loader>();
  const baseEvent = useBaseEvent();
  const [mode, setMode] = React.useState<"ALL" | "TO" | RankedModeShort>(
    baseEvent?.mapPickingStyle
      ? mapPickingStyleToShort[baseEvent.mapPickingStyle]
      : "ALL",
  );
  const [mapPool, setMapPool] = React.useState<MapPool>(
    baseEvent?.mapPool ? new MapPool(baseEvent.mapPool) : MapPool.EMPTY,
  );

  // can't change toToolsMode in editing
  // and also can't change tiebreaker maps in editing
  // because otherwise some team's picks that they already made
  // might start to overlap with tiebreaker maps
  if (eventToEdit && mode !== "TO") {
    return null;
  }

  return (
    <>
      <div>
        <label htmlFor={id}>Map picking style</label>
        <select
          onChange={(e) => setMode(e.target.value as RankedModeShort)}
          name="toToolsMode"
          defaultValue={mode}
          id={id}
          disabled={Boolean(eventToEdit)}
        >
          <option value="ALL">Prepicked by teams - All modes</option>
          <option value="SZ">Prepicked by teams - SZ only</option>
          <option value="TC">Prepicked by teams - TC only</option>
          <option value="RM">Prepicked by teams - RM only</option>
          <option value="CB">Prepicked by teams - CB only</option>
          <option value="TO">Picked by TO</option>
        </select>
      </div>
      {mode === "ALL" ? <CounterPickMapPoolSection /> : null}
      {mode === "TO" ? (
        <>
          <input type="hidden" name="pool" value={mapPool.serialized} />

          <MapPoolSelector
            className="w-full"
            mapPool={mapPool}
            title={t("common:maps.mapPool")}
            handleMapPoolChange={setMapPool}
            recentEvents={recentEventsWithMapPools}
            allowBulkEdit
          />
        </>
      ) : null}
    </>
  );
}

function TournamentEnabler({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) {
  const id = React.useId();

  return (
    <div>
      <label htmlFor={id}>Host on sendou.ink</label>
      <Toggle
        name="toToolsEnabled"
        id={id}
        tiny
        checked={checked}
        setChecked={setChecked}
      />
      <FormMessage type="info">
        Host the full event including bracket and sign ups on sendou.ink
      </FormMessage>
    </div>
  );
}

function MapPoolSection() {
  const { t } = useTranslation(["game-misc", "common"]);

  const baseEvent = useBaseEvent();
  const { recentEventsWithMapPools } = useLoaderData<typeof loader>();
  const [mapPool, setMapPool] = React.useState<MapPool>(
    baseEvent?.mapPool ? new MapPool(baseEvent.mapPool) : MapPool.EMPTY,
  );
  const [includeMapPool, setIncludeMapPool] = React.useState(
    Boolean(baseEvent?.mapPool),
  );

  const id = React.useId();

  return includeMapPool ? (
    <>
      <input type="hidden" name="pool" value={mapPool.serialized} />

      <MapPoolSelector
        className="w-full"
        mapPool={mapPool}
        title={t("common:maps.mapPool")}
        handleRemoval={() => setIncludeMapPool(false)}
        handleMapPoolChange={setMapPool}
        recentEvents={recentEventsWithMapPools}
        allowBulkEdit
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
  const baseEvent = useBaseEvent();
  const [mapPool, setMapPool] = React.useState<MapPool>(
    baseEvent?.tieBreakerMapPool
      ? new MapPool(baseEvent.tieBreakerMapPool)
      : MapPool.EMPTY,
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
        hideBanned
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
  mapPool: MapPool,
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

function TournamentFormatSelector() {
  const baseEvent = useBaseEvent();
  const [format, setFormat] = React.useState<TournamentFormatShort>(
    baseEvent?.tournamentCtx?.settings.bracketProgression
      ? bracketProgressionToShortTournamentFormat(
          baseEvent.tournamentCtx.settings.bracketProgression,
        )
      : "DE",
  );
  const [withUndergroundBracket, setWithUndergroundBracket] = React.useState(
    baseEvent?.tournamentCtx
      ? baseEvent.tournamentCtx.settings.bracketProgression.some(
          (b) => b.name === BRACKET_NAMES.UNDERGROUND,
        )
      : true,
  );
  const [thirdPlaceMatch, setThirdPlaceMatch] = React.useState(
    baseEvent?.tournamentCtx?.settings.thirdPlaceMatch ?? true,
  );
  const [teamsPerGroup, setTeamsPerGroup] = React.useState(
    baseEvent?.tournamentCtx?.settings.teamsPerGroup ?? 4,
  );

  return (
    <div className="stack md w-full">
      <Divider>Tournament format</Divider>
      <div>
        <Label htmlFor="format">Format</Label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as TournamentFormatShort)}
          className="w-max"
          name="format"
          id="format"
        >
          <option value="DE">Double-elimination</option>
          <option value="RR_TO_SE">
            Round robin -{">"} Single-elimination
          </option>
        </select>
      </div>

      {format === "DE" ? (
        <div>
          <Label htmlFor="withUndergroundBracket">
            With underground bracket
          </Label>
          <Toggle
            checked={withUndergroundBracket}
            setChecked={setWithUndergroundBracket}
            name="withUndergroundBracket"
            id="withUndergroundBracket"
          />
          <FormMessage type="info">
            Optional bracket for teams who lose in the first two rounds of
            losers bracket.
          </FormMessage>
        </div>
      ) : null}

      {format === "RR_TO_SE" ? (
        <div>
          <Label htmlFor="teamsPerGroup">Teams per group</Label>
          <select
            value={teamsPerGroup}
            onChange={(e) => setTeamsPerGroup(Number(e.target.value))}
            className="w-max"
            name="teamsPerGroup"
            id="teamsPerGroup"
          >
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>
      ) : null}

      {format === "RR_TO_SE" || (format === "DE" && withUndergroundBracket) ? (
        <div>
          <Label htmlFor="thirdPlaceMatch">Third place match</Label>
          <Toggle
            checked={thirdPlaceMatch}
            setChecked={setThirdPlaceMatch}
            name="thirdPlaceMatch"
            id="thirdPlaceMatch"
            tiny
          />
        </div>
      ) : null}

      {format === "RR_TO_SE" ? (
        <FollowUpBrackets teamsPerGroup={teamsPerGroup} />
      ) : null}
    </div>
  );
}

function FollowUpBrackets({ teamsPerGroup }: { teamsPerGroup: number }) {
  const baseEvent = useBaseEvent();
  const [autoCheckInAll, setAutoCheckInAll] = React.useState(
    baseEvent?.tournamentCtx?.settings.autoCheckInAll ?? false,
  );
  const [_brackets, setBrackets] = React.useState<Array<FollowUpBracket>>(
    () => {
      if (
        baseEvent?.tournamentCtx &&
        baseEvent.tournamentCtx.settings.bracketProgression[0].type ===
          "round_robin"
      ) {
        return baseEvent.tournamentCtx.settings.bracketProgression
          .slice(1)
          .map((b) => ({
            name: b.name,
            placements: b.sources?.flatMap((s) => s.placements) ?? [],
          }));
      }

      return [{ name: "Top cut", placements: [1, 2] }];
    },
  );

  const brackets = _brackets.map((b) => ({
    ...b,
    // handle teams per group changing after group placements have been set
    placements: b.placements.filter((p) => p <= teamsPerGroup),
  }));

  const validationErrorMsg = validateFollowUpBrackets(brackets, teamsPerGroup);

  return (
    <>
      {brackets.length > 1 ? (
        <div>
          <Label htmlFor="autoCheckInAll">
            Auto check-in to follow-up brackets
          </Label>
          <Toggle
            checked={autoCheckInAll}
            setChecked={setAutoCheckInAll}
            name="autoCheckInAll"
            id="autoCheckInAll"
            tiny
          />
          <FormMessage type="info">
            If disabled, the only follow-up bracket with automatic check-in is
            the top cut
          </FormMessage>
        </div>
      ) : null}
      <div>
        <RequiredHiddenInput
          isValid={!validationErrorMsg}
          name="followUpBrackets"
          value={JSON.stringify(brackets)}
        />
        <Label>Follow-up brackets</Label>
        <div className="stack lg">
          {brackets.map((b, i) => (
            <FollowUpBracketInputs
              key={i}
              teamsPerGroup={teamsPerGroup}
              onChange={(newBracket) => {
                setBrackets(
                  brackets.map((oldBracket, j) =>
                    j === i ? newBracket : oldBracket,
                  ),
                );
              }}
              bracket={b}
              nth={i + 1}
            />
          ))}
          <div className="stack sm horizontal">
            <Button
              size="tiny"
              onClick={() => {
                setBrackets([...brackets, { name: "", placements: [] }]);
              }}
              data-testid="add-bracket"
            >
              Add bracket
            </Button>
            <Button
              size="tiny"
              variant="destructive"
              onClick={() => {
                setBrackets(brackets.slice(0, -1));
              }}
              disabled={brackets.length === 1}
              testId="remove-bracket"
            >
              Remove bracket
            </Button>
          </div>

          {validationErrorMsg ? (
            <FormMessage type="error">{validationErrorMsg}</FormMessage>
          ) : null}
        </div>
      </div>
    </>
  );
}

function FollowUpBracketInputs({
  teamsPerGroup,
  bracket,
  onChange,
  nth,
}: {
  teamsPerGroup: number;
  bracket: FollowUpBracket;
  onChange: (bracket: FollowUpBracket) => void;
  nth: number;
}) {
  const id = React.useId();
  return (
    <div className="stack sm">
      <div className="stack items-center horizontal sm">
        <Label spaced={false} htmlFor={id}>
          {nth}. Name
        </Label>
        <Input
          value={bracket.name}
          onChange={(e) => onChange({ ...bracket, name: e.target.value })}
          id={id}
        />
      </div>
      <div className="stack items-center horizontal md flex-wrap">
        <Label spaced={false}>Group placements</Label>
        {nullFilledArray(teamsPerGroup).map((_, i) => {
          const placement = i + 1;
          return (
            <div key={i} className="stack horizontal items-center xs">
              <Label spaced={false} htmlFor={`${id}-${i}`}>
                <Placement placement={placement} />
              </Label>
              <input
                id={`${id}-${i}`}
                data-testid={`placement-${nth}-${placement}`}
                type="checkbox"
                checked={bracket.placements.includes(placement)}
                onChange={(e) => {
                  const newPlacements = e.target.checked
                    ? [...bracket.placements, placement]
                    : bracket.placements.filter((p) => p !== placement);
                  onChange({ ...bracket, placements: newPlacements });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
