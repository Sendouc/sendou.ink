import { CalendarEvent } from "@prisma/client";
import { Factory } from "fishery";
import prisma from "../client";

const TWELVE_HOURS = 43200000;

export default Factory.define<CalendarEvent>(({ sequence, onCreate }) => {
  onCreate((event) => {
    return prisma.calendarEvent.create({ data: event });
  });

  const now = new Date();

  return {
    id: sequence,
    date: new Date(now.getTime() + sequence * TWELVE_HOURS),
    description: `# Our great event ${sequence}\nCome play`,
    discordInviteUrl: "https://discord.gg/sendou",
    isTournament: true,
    format: "OTHER",
    name: `The Event #${sequence}`,
    posterId: sequence,
    eventUrl: "https://challonge.com",
    tags: [],
  };
});
