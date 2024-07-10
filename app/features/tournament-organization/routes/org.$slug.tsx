import type { SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { Main } from "~/components/Main";
import { databaseTimestampToDate, nullPaddedDatesOfMonth } from "~/utils/dates";
import { LinkButton } from "~/components/Button";
import type { MonthYear } from "~/features/plus-voting/core";

import "../tournament-organization.css";

import { loader } from "../loaders/org.$slug.server";
export { loader };

export default function TournamentOrganizationPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<Main>
			<EventCalendar month={data.month} year={data.year} events={data.events} />
		</Main>
	);
}

interface EventCalendarProps {
	month: number;
	year: number;
	events: SerializeFrom<typeof loader>["events"];
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function EventCalendar({ month, year, events }: EventCalendarProps) {
	const dates = nullPaddedDatesOfMonth({ month, year });

	return (
		<div className="stack sm">
			<MonthSelector month={month} year={year} />
			<div className="org__calendar">
				{DAY_HEADERS.map((day) => (
					<div key={day} className="org__calendar__day-header">
						{day}
					</div>
				))}
				{dates.map((date, i) => {
					const daysEvents = events.filter(
						(event) =>
							databaseTimestampToDate(event.startTime).getDate() ===
							date?.getDate(),
					);

					return <EventCalendarCell key={i} date={date} events={daysEvents} />;
				})}
			</div>
		</div>
	);
}

function EventCalendarCell({
	date,
	events,
}: {
	date: Date | null;
	events: SerializeFrom<typeof loader>["events"];
}) {
	// xxx: events.length > 0
	// xxx: logo when non sendou ink event

	return (
		<div
			className={clsx("org__calendar__day", {
				org__calendar__day__previous: !date,
				org__calendar__day__today:
					date?.getDate() === new Date().getDate() &&
					date?.getMonth() === new Date().getMonth() &&
					date?.getFullYear() === new Date().getFullYear(),
			})}
		>
			<div className="org__calendar__day__date">{date?.getDate()}</div>
			{events.length === 1 ? (
				<img
					className="org__calendar__day__logo"
					src={events[0].logoUrl!}
					width={32}
					height={32}
					alt={events[0].name}
				/>
			) : null}
		</div>
	);
}

const monthYearSearchParams = ({ month, year }: MonthYear) =>
	new URLSearchParams([
		["month", String(month)],
		["year", String(year)],
	]).toString();
function MonthSelector({ month, year }: { month: number; year: number }) {
	const date = new Date(Date.UTC(year, month, 1));

	return (
		<div className="org__calendar__month-selector">
			<LinkButton
				variant="minimal"
				aria-label="Previous month"
				to={`?${monthYearSearchParams(
					month === 0
						? { month: 11, year: year - 1 }
						: {
								month: date.getMonth() - 1,
								year: date.getFullYear(),
							},
				)}`}
			>
				{"<"}
			</LinkButton>
			<div>
				{date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
				})}
			</div>
			<LinkButton
				variant="minimal"
				aria-label="Following month"
				to={`?${monthYearSearchParams(
					month === 11
						? { month: 0, year: year + 1 }
						: {
								month: date.getMonth() + 1,
								year: date.getFullYear(),
							},
				)}`}
			>
				{">"}
			</LinkButton>
		</div>
	);
}
