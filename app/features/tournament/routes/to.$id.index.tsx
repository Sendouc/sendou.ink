import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { tournamentBracketsPage, tournamentRegisterPage } from "~/utils/urls";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { tournamentIdFromParams } from "../tournament-utils";

// xxx: redirect to standings if over
export const loader = ({ params }: LoaderFunctionArgs) => {
	const eventId = tournamentIdFromParams(params);

	if (!hasTournamentStarted(eventId)) {
		throw redirect(tournamentRegisterPage(eventId));
	}

	throw redirect(tournamentBracketsPage({ tournamentId: eventId }));
};
