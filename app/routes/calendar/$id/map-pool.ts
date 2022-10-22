import { json, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { db } from "~/db";
import { actualNumber, id } from "~/utils/zod";

export const loader: LoaderFunction = ({ params }) => {
  const parsedParams = z
    .object({ id: z.preprocess(actualNumber, id) })
    .parse(params);

  return json(db.calendarEvents.findMapPoolByEventId(parsedParams.id));
};
