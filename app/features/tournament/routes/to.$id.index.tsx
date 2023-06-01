import { redirect, type LoaderArgs } from "@remix-run/node";
import { tournamentBracketsPage, tournamentRegisterPage } from "~/utils/urls";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { tournamentIdFromParams } from "../tournament-utils";

export const loader = ({ params }: LoaderArgs) => {
  const eventId = tournamentIdFromParams(params);

  if (!hasTournamentStarted(eventId)) {
    throw redirect(tournamentRegisterPage(eventId));
  }

  throw redirect(tournamentBracketsPage(eventId));
};
