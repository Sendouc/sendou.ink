import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const botEventsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const dateSixHoursAgo = new Date(new Date().getTime() - 21600000);

  const events = await prisma.calendarEvent.findMany({
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
        select: {
          discordId: true,
          username: true,
          discriminator: true,
        },
      },
    },
    where: { date: { gt: dateSixHoursAgo } },
    orderBy: { date: "asc" },
  });

  res.status(200).json(events);
};

export default botEventsHandler;
