import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";

import "../tournament-organization.css";

import { EventCalendar } from "../components/EventCalendar";
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
