import prisma from "prisma/client";
import { eventSchema } from "utils/validators/event";
import * as z from "zod";

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
  addEvent,
};
