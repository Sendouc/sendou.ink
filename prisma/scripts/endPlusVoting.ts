import { Prisma } from "@prisma/client";
import { getPercentageFromCounts } from "../../utils/plus";
import { VOUCH_CRITERIA } from "../../utils/constants";
import prisma from "../client";

// Include Prisma's .env file as well, so we can fetch the DATABASE_URL
require("dotenv").config({ path: "prisma/.env" });

const main = async () => {
  const [ballots, statuses, suggestions] = await Promise.all([
    prisma.plusBallot.findMany({
      where: { isStale: false },
      include: { voterUser: { include: { plusStatus: true } } },
    }),
    prisma.plusStatus.findMany({}),
    prisma.plusSuggestion.findMany({}),
  ]);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const summariesByTier = [
    new Map<number, Prisma.PlusVotingSummaryCreateManyInput>(),
    new Map<number, Prisma.PlusVotingSummaryCreateManyInput>(),
    new Map<number, Prisma.PlusVotingSummaryCreateManyInput>(),
    new Map<number, Prisma.PlusVotingSummaryCreateManyInput>(),
  ];

  for (const ballot of ballots) {
    if (!summariesByTier[ballot.tier].has(ballot.votedId)) {
      summariesByTier[ballot.tier].set(ballot.votedId, {
        month,
        tier: ballot.tier,
        userId: ballot.votedId,
        wasSuggested: suggestions.some(
          (suggestion) =>
            suggestion.tier === ballot.tier &&
            suggestion.suggestedId === ballot.votedId
        ),
        wasVouched: statuses.some(
          (status) =>
            status.vouchTier === ballot.tier && status.userId === ballot.votedId
        ),
        year,
        countsEU: [0, 0, 0, 0],
        countsNA: [0, 0, 0, 0],
      });
    }

    const summary = summariesByTier[ballot.tier].get(ballot.votedId);
    if (!summary) throw Error("unexpected no summary");

    const isNA = ballot.voterUser.plusStatus!.region === "NA";

    const scoreToIndex = { "-2": 0, "-1": 1, "1": 2, "2": 3 } as const;
    const arrToChange = (isNA ? summary.countsNA : summary.countsEU) as [
      number,
      number,
      number,
      number
    ];
    const key = ("" + ballot.score) as keyof typeof scoreToIndex;
    arrToChange[scoreToIndex[key]]++;
  }

  const members: [number[], number[], number[], number[]] = [[], [], [], []];
  const canVouch: [null, number[], number[], number[]] = [null, [], [], []];
  const vouchRevoked: number[] = [];

  const alreadyMember = new Set<number>();

  for (const [i, summaries] of [
    Array.from(summariesByTier[1].values()),
    Array.from(summariesByTier[2].values()),
    Array.from(summariesByTier[3].values()),
  ].entries()) {
    const tier = i + 1;

    for (const summary of summaries) {
      const plusStatus = statuses.find(
        (status) => status.userId === summary.userId
      );
      if (!plusStatus) {
        throw Error("unexpected no plusStatus in loop");
      }

      const passedVoting =
        getPercentageFromCounts(
          summary.countsNA as number[],
          summary.countsEU as number[],
          plusStatus.region
        ) >= 50;

      if (passedVoting) {
        if (!alreadyMember.has(summary.userId)) {
          members[tier].push(summary.userId);
          alreadyMember.add(summary.userId);
        }
      } else {
        // get put to a lower tier only if not suggestion or vouch
        if (
          !summary.wasSuggested &&
          !summary.wasVouched &&
          !alreadyMember.has(summary.userId)
        ) {
          const tierToDemoteTo = tier === 3 ? 0 : tier + 1;
          members[tierToDemoteTo].push(summary.userId);
          alreadyMember.add(summary.userId);
        }

        // if they were vouched time for whoever vouched them to have their perms revoked for 6 months
        if (plusStatus.vouchTier === tier) {
          if (!plusStatus.voucherId) {
            throw Error("unexpexted no voucher id");
          }
          vouchRevoked.push(plusStatus.voucherId);
        }

        continue;
      }

      const gotVouchPermits =
        getPercentageFromCounts(
          summary.countsNA as number[],
          summary.countsEU as number[],
          plusStatus.region
        ) >= VOUCH_CRITERIA[tier];

      if (gotVouchPermits) {
        canVouch[tier]!.push(summary.userId);
      }
    }
  }

  console.log("deleting stale plus ballots and setting can vouch for null");

  await Promise.all([
    prisma.plusBallot.deleteMany({ where: { isStale: true } }),
    prisma.plusStatus.updateMany({
      data: { canVouchFor: null },
    }),
  ]);

  const now = new Date();

  console.log("doing a lot of stuff");

  await prisma.$transaction([
    prisma.plusBallot.updateMany({ data: { isStale: true } }),
    prisma.plusSuggestion.deleteMany({}),
    prisma.plusVotingSummary.createMany({
      data: [
        ...Array.from(summariesByTier[1].values()),
        ...Array.from(summariesByTier[2].values()),
        ...Array.from(summariesByTier[3].values()),
      ],
    }),
    prisma.plusStatus.updateMany({
      data: { vouchTier: null, voucherId: null },
    }),
    prisma.plusStatus.updateMany({
      where: { canVouchAgainAfter: { lt: new Date() } },
      data: { canVouchAgainAfter: null },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: members[0] } },
      data: { membershipTier: null },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: members[1] } },
      data: { membershipTier: 1 },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: members[2] } },
      data: { membershipTier: 2 },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: members[3] } },
      data: { membershipTier: 3 },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: canVouch[1] } },
      data: { canVouchFor: 1 },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: canVouch[2] } },
      data: { canVouchFor: 2 },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: canVouch[3] } },
      data: { canVouchFor: 3 },
    }),
    prisma.plusStatus.updateMany({
      where: { userId: { in: vouchRevoked } },
      data: {
        canVouchAgainAfter: new Date(now.getFullYear(), now.getMonth() + 5, 1),
      },
    }),
  ]);

  console.log("done with a lot of stuff");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
