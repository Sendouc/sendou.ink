import type { SerializeFrom } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { NewTabs } from "~/components/NewTabs";
import { Pagination } from "~/components/Pagination";
import { Placement } from "~/components/Placement";
import { databaseTimestampNow, databaseTimestampToDate } from "~/utils/dates";
import {
	calendarEventPage,
	tournamentPage,
	userSubmittedImage,
} from "~/utils/urls";
import { EventCalendar } from "../components/EventCalendar";
import { TOURNAMENT_SERIES_EVENTS_PER_PAGE } from "../tournament-organization-constants";

import "../tournament-organization.css";

import { loader } from "../loaders/org.$slug.server";
export { loader };

export default function TournamentOrganizationPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<Main className="stack lg">
			{data.organization.series.length > 0 ? (
				<SeriesSelector series={data.organization.series} />
			) : null}
			{data.series ? <SeriesView /> : <AllTournamentsView />}
		</Main>
	);
}

function AllTournamentsView() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="stack lg horizontal">
			<EventCalendar month={data.month} year={data.year} events={data.events} />
			<EventsList />
		</div>
	);
}

function SeriesView() {
	const data = useLoaderData<typeof loader>();

	return (
		<NewTabs
			disappearing
			tabs={[
				{
					label: "Events",
					number: data.series?.eventsCount,
				},
				{
					label: "Leaderboards",
					// xxx: todo hidden lb
					hidden: false,
				},
			]}
			content={[
				{
					key: "events",
					element: (
						<div className="stack lg">
							<EventsList showYear />
							{data.series ? <EventsPagination series={data.series} /> : null}
						</div>
					),
				},
				{
					key: "leaderboards",
					element: <EventLeaderboards />,
				},
			]}
		/>
	);
}

function SeriesSelector({
	series,
}: {
	series: SerializeFrom<typeof loader>["organization"]["series"];
}) {
	return (
		<div className="stack horizontal md flex-wrap">
			<SeriesButton>All tournaments</SeriesButton>
			{series.map((series) => (
				<SeriesButton key={series.id} seriesId={series.id}>
					{series.name}
				</SeriesButton>
			))}
		</div>
	);
}

function SeriesButton({
	children,
	seriesId,
}: {
	children: React.ReactNode;
	seriesId?: number;
}) {
	return (
		<LinkButton
			variant="minimal"
			size="tiny"
			to={`?series=${seriesId ?? "all"}`}
		>
			{children}
		</LinkButton>
	);
}

function EventsList({ showYear }: { showYear?: boolean }) {
	const data = useLoaderData<typeof loader>();

	const now = databaseTimestampNow();
	const pastEvents = data.events.filter((event) => event.startTime < now);
	const upcomingEvents = data.events.filter((event) => event.startTime >= now);

	return (
		<div className="w-full stack xs">
			{upcomingEvents.length > 0 ? (
				<SectionDivider>Upcoming events</SectionDivider>
			) : null}
			<div className="stack md">
				{upcomingEvents.map((event) => (
					<EventInfo key={event.eventId} event={event} showYear={showYear} />
				))}
			</div>
			{pastEvents.length > 0 ? (
				<SectionDivider>Past events</SectionDivider>
			) : null}
			<div className="stack md">
				{pastEvents.map((event) => (
					<EventInfo key={event.eventId} event={event} showYear={showYear} />
				))}
			</div>
		</div>
	);
}

function SectionDivider({ children }: { children: React.ReactNode }) {
	return <div className="org__section-divider">{children}</div>;
}

// xxx: winners
function EventInfo({
	event,
	showYear,
}: {
	event: SerializeFrom<typeof loader>["events"][number];
	showYear?: boolean;
}) {
	return (
		<div className="stack sm">
			<Link
				to={
					event.tournamentId
						? tournamentPage(event.tournamentId)
						: calendarEventPage(event.eventId)
				}
				className="org__event-info"
			>
				{event.logoUrl ? (
					<img src={event.logoUrl} alt={event.name} width={38} height={38} />
				) : null}
				<div>
					<div className="org__event-info__name">{event.name}</div>
					<time className="org__event-info__time">
						{databaseTimestampToDate(event.startTime).toLocaleString("en-US", {
							day: "numeric",
							month: "numeric",
							hour: "numeric",
							minute: "numeric",
							year: showYear ? "numeric" : undefined,
						})}
					</time>
				</div>
			</Link>
			{event.tournamentWinners || event.eventWinners ? (
				<EventWinners winner={event.tournamentWinners ?? event.eventWinners!} />
			) : null}
		</div>
	);
}

function EventWinners({
	winner,
}: {
	winner: NonNullable<
		| SerializeFrom<typeof loader>["events"][number]["tournamentWinners"]
		| SerializeFrom<typeof loader>["events"][number]["eventWinners"]
	>;
}) {
	return (
		<div className="stack xs">
			<div className="stack horizontal sm items-center font-semi-bold">
				<Placement placement={1} size={24} />
				{winner.avatarUrl ? (
					<img
						src={userSubmittedImage(winner.avatarUrl)}
						alt=""
						width={24}
						height={24}
						className="rounded-full"
					/>
				) : null}
				{winner.name}
			</div>
			<div className="stack xs horizontal">
				{winner.members.map((member) => (
					<Avatar key={member.discordId} user={member} size="xxs" />
				))}
			</div>
		</div>
	);
}

function EventsPagination({
	series,
}: { series: NonNullable<SerializeFrom<typeof loader>["series"]> }) {
	const [, setSearchParams] = useSearchParams();

	const setPage = (page: number) =>
		setSearchParams((prev) => {
			prev.set("page", String(page));

			return prev;
		});

	return (
		<Pagination
			currentPage={series.page}
			nextPage={() => setPage(series.page + 1)}
			pagesCount={Math.ceil(
				series.eventsCount / TOURNAMENT_SERIES_EVENTS_PER_PAGE,
			)}
			previousPage={() => setPage(series.page - 1)}
			setPage={setPage}
		/>
	);
}

function EventLeaderboards() {
	return <div>Lb!</div>;
}
