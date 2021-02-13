import { Prisma } from "@prisma/client";
import prisma from "../client";
import summaries from "./mongo/summarypeople.json";

const discordIdToUserId = new Map<string, number>();

const main = async () => {
  const users = await prisma.user.findMany({});
  users.forEach((user) => {
    discordIdToUserId.set(user.discordId, user.id);
  });

  const summariesToInsert: Prisma.PlusVotingSummaryCreateManyInput[] = [];

  summaries.forEach((summary) => {
    if (!discordIdToUserId.get(summary.discord_id) || !summary.score.eu_count) {
      return;
    }
    summariesToInsert.push({
      month: summary.month,
      tier: summary.plus_server === "ONE" ? 1 : 2,
      userId: discordIdToUserId.get(summary.discord_id)!,
      wasSuggested: summary.suggested ?? false,
      year: summary.year,
      wasVouched: summary.vouched ?? false,
      scoreTotal: -1,
      countsEU: summary.score.eu_count,
      countsNA: summary.score.na_count,
    });
  });

  await prisma.plusVotingSummary.deleteMany({});
  await prisma.plusVotingSummary.createMany({ data: summariesToInsert });
  console.log("done");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
