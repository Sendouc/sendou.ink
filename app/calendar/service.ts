import { Prisma } from "@prisma/client";
import prisma from "prisma/client";
import { eventSchema } from "utils/validators/event";
import * as z from "zod";

export type Events = Prisma.PromiseReturnType<typeof events>;

const events = () => {
  return prisma.calendarEvent.findMany({
    where: { date: { gt: new Date() } },
    include: { poster: true },
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

export default {
  events,
  addEvent,
};
