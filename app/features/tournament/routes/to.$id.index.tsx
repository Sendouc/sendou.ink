import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { tournamentBracketsPage, tournamentRegisterPage } from "~/utils/urls";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { tournamentIdFromParams } from "../tournament-utils";

export const loader = ({ params }: LoaderFunctionArgs) => {
  const eventId = tournamentIdFromParams(params);

  if (!hasTournamentStarted(eventId)) {
    throw redirect(tournamentRegisterPage(eventId));
  }

  throw redirect(tournamentBracketsPage(eventId));
};
