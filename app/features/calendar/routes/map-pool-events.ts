import { json, type SerializeFrom } from "@remix-run/node";
import { findAllEventsWithMapPools } from "~/db/models/calendar/queries.server";

export const loader = () => {
  return json({
    events: findAllEventsWithMapPools(),
  });
};

export type EventsWithMapPoolsLoaderData = SerializeFrom<typeof loader>;
export type SerializedMapPoolEvent =
  EventsWithMapPoolsLoaderData["events"][number];
