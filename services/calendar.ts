import { Prisma, User } from "@prisma/client";
import prisma from "prisma/client";
import { UserInputError } from "utils/api";
import { ADMIN_ID, TAGS } from "utils/constants";
import { userBasicSelection } from "utils/prisma";
import { eventSchema } from "utils/validators/event";
import * as z from "zod";

export type Events = Prisma.PromiseReturnType<typeof events>;

const events = async () => {
  const dateSixHoursAgo = new Date(new Date().getTime() - 21600000);
  const result = await prisma.calendarEvent.findMany({
    select: {
      date: true,
      description: true,
      discordInviteUrl: true,
      eventUrl: true,
      format: true,
      id: true,
      name: true,
      tags: true,
      poster: {
        select: userBasicSelection,
      },
    },
    where: { date: { gt: dateSixHoursAgo } },
    orderBy: { date: "asc" },
  });

  return result.map((e) => ({
    ...e,
    tags: e.tags.sort(
      (a, b) =>
        TAGS.findIndex((t) => t.code === a) -
        TAGS.findIndex((t) => t.code === b)
    ),
  }));
};

const addEvent = async ({
  input,
  user,
}: {
  input: z.infer<typeof eventSchema>;
  user: User;
}) => {
  return prisma.calendarEvent.create({
    data: {
      ...input,
      isTournament: true,
      date: new Date(input.date),
      posterId: user.id,
    },
  });
};

const editEvent = async ({
  event,
  eventId,
  user,
}: {
  event: z.infer<typeof eventSchema>;
  eventId: number;
  user: User;
}) => {
  const existingEvent = await prisma.calendarEvent.findFirst({
    where: { AND: [{ id: eventId }, { posterId: user.id }] },
  });
  if (!existingEvent && user.id !== ADMIN_ID) {
    throw new UserInputError("no event to edit");
  }

  return prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      ...event,
      isTournament: true,
      date: new Date(event.date),
    },
  });
};

const deleteEvent = async ({
  user,
  eventId,
}: {
  eventId: number;
  user: User;
}) => {
  const existingEvent = await prisma.calendarEvent.findFirst({
    where: { AND: [{ id: eventId }, { posterId: user.id }] },
  });
  if (!existingEvent && user.id !== ADMIN_ID) {
    throw new UserInputError("no event to delete");
  }

  return prisma.calendarEvent.delete({ where: { id: eventId } });
};

const calendarService = {
  events,
  addEvent,
  editEvent,
  deleteEvent,
};

export default calendarService;
