import { Link, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import type { SerializeFrom } from "@remix-run/node";
import { databaseTimestampNow, databaseTimestampToDate } from "~/utils/dates";
import { calendarEventPage, tournamentPage } from "~/utils/urls";
import { EventCalendar } from "../components/EventCalendar";

import "../tournament-organization.css";

import { loader } from "../loaders/org.$slug.server";
export { loader };

export default function TournamentOrganizationPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<Main>
			<div className="stack lg horizontal">
				<EventCalendar
					month={data.month}
					year={data.year}
					events={data.events}
				/>
				<EventsList />
			</div>
		</Main>
	);
}

function EventsList() {
	const data = useLoaderData<typeof loader>();

	const now = databaseTimestampNow();
	const pastEvents = data.events.filter((event) => event.startTime < now);
	const upcomingEvents = data.events.filter((event) => event.startTime >= now);

	return (
		<div className="w-full stack sm">
			{upcomingEvents.length > 0 ? (
				<SectionDivider>Upcoming events</SectionDivider>
			) : null}
			{upcomingEvents.map((event) => (
				<EventInfo key={event.eventId} event={event} />
			))}
			{pastEvents.length > 0 ? (
				<SectionDivider>Past events</SectionDivider>
			) : null}
			{pastEvents.map((event) => (
				<EventInfo key={event.eventId} event={event} />
			))}
		</div>
	);
}

function SectionDivider({ children }: { children: React.ReactNode }) {
	return <div className="org__section-divider">{children}</div>;
}

// xxx: winners
function EventInfo({
	event,
}: { event: SerializeFrom<typeof loader>["events"][number] }) {
	// xxx: fix coercion!
	return (
		<Link
			to={
				event.tournamentId
					? tournamentPage(event.tournamentId)
					: calendarEventPage(event.eventId)
			}
			className="org__event-info"
		>
			<img src={event.logoUrl!} alt={event.name} width={38} height={38} />
			<div>
				<div className="org__event-info__name">{event.name}</div>
				<time className="org__event-info__time">
					{databaseTimestampToDate(event.startTime).toLocaleString("en-US", {
						day: "numeric",
						month: "numeric",
						hour: "numeric",
						minute: "numeric",
					})}
				</time>
			</div>
		</Link>
	);
}
