import { type LoaderArgs, redirect } from "@remix-run/node";
import { tournamentIdFromParams } from "../tournament-utils";
import { notFoundIfFalsy } from "~/utils/remix";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { toToolsMapsPage, toToolsRegisterPage } from "~/utils/urls";

export const loader = ({ params }: LoaderArgs) => {
  const eventId = tournamentIdFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(eventId));

  if (event.isBeforeStart) {
    throw redirect(toToolsRegisterPage(event.id));
  }

  throw redirect(toToolsMapsPage(event.id));
};
