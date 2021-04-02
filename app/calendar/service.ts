import { Prisma } from "@prisma/client";
import { httpError } from "@trpc/server";
import prisma from "prisma/client";
import { ADMIN_ID } from "utils/constants";
import { userBasicSelection } from "utils/prisma";
import { eventSchema } from "utils/validators/event";
import * as z from "zod";

export type Events = Prisma.PromiseReturnType<typeof events>;

const events = () => {
  return prisma.calendarEvent.findMany({
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
    where: { date: { gt: new Date() } },
    orderBy: { date: "asc" },
  });
};

const addEvent = async ({
  input,
  userId,
}: {
  input: z.infer<typeof eventSchema>;
  userId: number;
}) => {
  return prisma.calendarEvent.create({
    data: {
      ...input,
      isTournament: true,
      date: new Date(input.date),
      posterId: userId,
    },
  });
};

const editEvent = async ({
  event,
  userId,
  eventId,
}: {
  event: z.infer<typeof eventSchema>;
  eventId: number;
  userId: number;
}) => {
  const existingEvent = await prisma.calendarEvent.findFirst({
    where: { AND: [{ id: eventId }, { posterId: userId }] },
  });
  if (!existingEvent && userId !== ADMIN_ID) {
    throw httpError.badRequest("no event to edit");
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
  userId,
  eventId,
}: {
  eventId: number;
  userId: number;
}) => {
  const existingEvent = await prisma.calendarEvent.findFirst({
    where: { AND: [{ id: eventId }, { posterId: userId }] },
  });
  if (!existingEvent && userId !== ADMIN_ID) {
    throw httpError.badRequest("no event to delete");
  }

  return prisma.calendarEvent.delete({ where: { id: eventId } });
};

export default {
  events,
  addEvent,
  editEvent,
  deleteEvent,
};
