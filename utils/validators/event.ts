import * as z from "zod";

export const EVENT_DESCRIPTION_LIMIT = 2000;

export const eventSchema = z.object({
  name: z.string().min(5).max(100),
  description: z.string().min(10).max(EVENT_DESCRIPTION_LIMIT),
  date: z.date().refine((val) => {
    const now = new Date();
    if (now.getTime() < val.getTime()) return false;

    now.setMonth(now.getMonth() + 12);

    if (now.getTime() < val.getTime()) return false;

    return true;
  }),
  eventUrl: z.string().url(),
  discordInviteUrl: z
    .string()
    .url()
    .refine(
      (val) =>
        val.startsWith("https://discord.io/") ||
        val.startsWith("https://discord.gg/"),
      {
        message:
          "Has to start with 'https://discord.gg/' or 'https://discord.io/'",
      }
    ),
  tags: z.array(
    z.enum([
      "SZ",
      "TW",
      "SPECIAL",
      "ART",
      "MONEY",
      "REGION",
      "LOW",
      "COUNT",
      "MULTIPLE",
      "S1",
      "LAN",
    ])
  ),
  isTournament: z.boolean(),
  format: z.array(
    z.enum([
      "SE",
      "DE",
      "GROUPS2SE",
      "GROUPS2DE",
      "SWISS2SE",
      "SWISS2DE",
      "SWISS",
      "OTHER",
    ])
  ),
});
