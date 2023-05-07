import { redirect, type LoaderArgs } from "@remix-run/node";
import { toToolsBracketsPage, toToolsRegisterPage } from "~/utils/urls";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { tournamentIdFromParams } from "../tournament-utils";

export const loader = ({ params }: LoaderArgs) => {
  const eventId = tournamentIdFromParams(params);

  if (!hasTournamentStarted(eventId)) {
    throw redirect(toToolsRegisterPage(eventId));
  }

  throw redirect(toToolsBracketsPage(eventId));
};
