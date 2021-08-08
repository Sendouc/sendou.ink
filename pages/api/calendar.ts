import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import calendarService, { Events } from "services/calendar";
import { Serialized } from "utils/types";
import { eventSchema } from "utils/validators/event";
import { ZodError } from "zod";
import * as z from "zod";

export type CalendarGet = Serialized<Events>;

const GET = async (_req: NextApiRequest, res: NextApiResponse<Events>) => {
  const events = await calendarService.events();
  res.status(200).json(events);
};

export type CalendarPostInput = z.infer<typeof eventSchema>;

const POST = async (
  req: NextApiRequest,
  res: NextApiResponse<Events | ZodError>
) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await calendarService.addEvent({ user, input: parsed.data });

  res.status(200).end();
};

const calendarPutInput = z.object({ event: eventSchema, eventId: z.number() });
export type CalendarPutInput = z.infer<typeof calendarPutInput>;

const PUT = async (
  req: NextApiRequest,
  res: NextApiResponse<Events | ZodError>
) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = calendarPutInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await calendarService.editEvent({
    user,
    event: parsed.data.event,
    eventId: parsed.data.eventId,
  });

  res.status(200).end();
};

const calendarDeleteInput = z.object({ eventId: z.number() });
export type CalendarDeleteInput = z.infer<typeof calendarDeleteInput>;

const DELETE = async (
  req: NextApiRequest,
  res: NextApiResponse<Events | ZodError>
) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = calendarDeleteInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await calendarService.deleteEvent({ user, eventId: parsed.data.eventId });

  res.status(200).end();
};

const calendarHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET, POST, PUT, DELETE });

export default calendarHandler;
