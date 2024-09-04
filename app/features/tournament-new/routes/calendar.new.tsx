import type { MetaFunction, SerializeFrom } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { DateInput } from "~/components/DateInput";
import { FormMessage } from "~/components/FormMessage";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { CrossIcon } from "~/components/icons/Cross";
import { TrashIcon } from "~/components/icons/Trash";
import type { Badge as BadgeType, CalendarEventTag } from "~/db/types";
import { CALENDAR_EVENT } from "~/features/calendar/calendar-constants";
import { Tags } from "~/features/calendar/components/Tags";
import { useIsMounted } from "~/hooks/useIsMounted";
import { isDefined } from "~/utils/arrays";
import {
	databaseTimestampToDate,
	getDateAtNextFullHour,
	getDateWithHoursOffset,
} from "~/utils/dates";
import type { SendouRouteHandle } from "~/utils/remix";
import { pathnameFromPotentialURL } from "~/utils/strings";

import "~/styles/calendar-new.css";
import "~/styles/maps.css";

import { MapPoolSelector } from "~/components/MapPoolSelector";
import {
	calendarEventMaxDate,
	calendarEventMinDate,
} from "~/features/calendar/calendar-utils";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { action } from "../actions/calendar.new.server";
import { loader } from "../loaders/calendar.new.server";
export { action, loader };

export const meta: MetaFunction = (args) => {
	const data = args.data as SerializeFrom<typeof loader> | null;

	if (!data) return [];

	return [{ title: data.title }];
};

export const handle: SendouRouteHandle = {
	i18n: ["calendar", "game-misc"],
};

const useBaseEvent = () => {
	const { eventToEdit } = useLoaderData<typeof loader>();

	return eventToEdit;
};

export default function CalendarNewEventPage() {
	const baseEvent = useBaseEvent();

	return (
		<Main className="calendar-new__container">
			<div className="stack md">
				<EventForm key={baseEvent?.eventId} />
			</div>
		</Main>
	);
}

function EventForm() {
	const { t } = useTranslation();
	const { eventToEdit } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	return (
		<fetcher.Form className="stack md items-start" method="post">
			{eventToEdit && (
				<input type="hidden" name="eventToEditId" value={eventToEdit.eventId} />
			)}
			<NameInput />
			<DescriptionTextarea supportsMarkdown={false} />
			<OrganizationSelect />
			<DatesInput allowMultiDate />
			<BracketUrlInput />
			<DiscordLinkInput />
			<TagsAdder />
			<BadgesAdder />
			<MapPoolSection />
			<SubmitButton
				className="mt-4"
				testId="submit-button"
				state={fetcher.state}
			>
				{t("actions.submit")}
			</SubmitButton>
		</fetcher.Form>
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

function OrganizationSelect() {
	const id = React.useId();
	const data = useLoaderData<typeof loader>();
	const baseEvent = useBaseEvent();

	if (data.organizations.length === 0) return null;

	return (
		<div>
			<Label htmlFor={id}>Organization</Label>
			<select
				id={id}
				name="organizationId"
				defaultValue={baseEvent?.organization?.id}
			>
				<option>Select an organization</option>
				{data.organizations.map((org) => (
					<option key={org.id} value={org.id}>
						{org.name}
					</option>
				))}
			</select>
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
										name="startTimes"
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
		// @ts-expect-error TODO: fix this (5.5 version)
		(tag) => !tags.includes(tag) && tag !== "BADGE",
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
						// @ts-expect-error TODO: fix this (5.5 version)
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
