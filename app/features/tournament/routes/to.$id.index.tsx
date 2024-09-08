import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
	tournamentBracketsPage,
	tournamentRegisterPage,
	tournamentResultsPage,
} from "~/utils/urls";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { tournamentIdFromParams } from "../tournament-utils";
import hasTournamentFinalized from "../queries/hasTournamentFinalized.server";

export const loader = ({ params }: LoaderFunctionArgs) => {
	const tournamentId = tournamentIdFromParams(params);

	if (!hasTournamentStarted(tournamentId)) {
		return redirect(tournamentRegisterPage(tournamentId));
	}

	if (!hasTournamentFinalized(tournamentId)) {
		return redirect(tournamentBracketsPage({ tournamentId }));
	}

	return redirect(tournamentResultsPage(tournamentId));
};
