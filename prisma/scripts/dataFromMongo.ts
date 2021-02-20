import { Prisma } from "@prisma/client";
import prisma from "../client";
import summaries from "./mongo/summarypeople.json";
import usersMongo from "./mongo/users.json";

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

  const plusStatusToInsert: Prisma.PlusStatusCreateManyInput[] = [];

  const tierToInt = (tier: any) => {
    if (tier === "ONE") return 1;
    if (tier === "TWO") return 2;

    return undefined;
  };

  usersMongo.forEach((user) => {
    if (!user.plus || !user.plus.plus_region) {
      return;
    }
    if (!discordIdToUserId.get(user.discord_id)) {
      console.log("wtf");
      return;
    }
    plusStatusToInsert.push({
      // @ts-ignore
      userId: discordIdToUserId.get(user.discord_id),
      region: user.plus.plus_region,
      canVouchAgainAfter: user.plus.can_vouch_again_after
        ? new Date(user.plus.can_vouch_again_after["$date"])
        : null,
      canVouchFor: tierToInt(user.plus.can_vouch),
      membershipTier: tierToInt(user.plus.membership_status),
      vouchTier: tierToInt(user.plus.vouch_status),
      voucherId: discordIdToUserId.get(user.plus.voucher_discord_id),
    });
  });

  console.log({ plusStatusToInsert });

  await prisma.plusStatus.deleteMany({});
  await prisma.plusVotingSummary.deleteMany({});
  await prisma.plusStatus.createMany({ data: plusStatusToInsert });
  await prisma.plusVotingSummary.createMany({ data: summariesToInsert });
  console.log("done");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
