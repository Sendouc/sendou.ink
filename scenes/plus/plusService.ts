import { PlusRegion, Prisma } from "@prisma/client";
import prisma from "prisma/client";
import { userBasicSelection } from "utils/prisma";

export type GetVotingSummariesByMonthAndTierData = Prisma.PromiseReturnType<
  typeof getVotingSummariesByMonthAndTier
>;

const getPercentageFromCounts = (
  countsNA: number[],
  countsEU: number[],
  votedUserRegion: PlusRegion
) => {
  const sameRegionArr = votedUserRegion === "NA" ? countsNA : countsEU;
  const otherRegionArr = votedUserRegion === "NA" ? countsEU : countsNA;

  const sameSum =
    sameRegionArr[0] * 0 +
    sameRegionArr[1] * 1 +
    sameRegionArr[2] * 2 +
    sameRegionArr[3] * 3;
  const sameVoterCount = sameRegionArr.reduce((acc, cur) => acc + cur, 0);
  const sameMax = sameVoterCount * 3;

  const otherSum = otherRegionArr[1] * 0 + otherRegionArr[2] * 1;
  const otherVoterCount = otherRegionArr.reduce((acc, cur) => acc + cur, 0);
  const otherMax = otherVoterCount * 1;

  return ((sameSum + otherSum) / (sameMax + otherMax)) * 100;
};

const getVotingSummariesByMonthAndTier = async ({
  tier,
  year,
  month,
}: {
  tier: 1 | 2;
  year: number;
  month: number;
}) => {
  const summaries = await prisma.plusVotingSummary.findMany({
    where: { tier, year, month },
    select: {
      countsEU: true,
      wasSuggested: true,
      wasVouched: true,
      countsNA: true,
      user: {
        select: {
          ...userBasicSelection,
          plusStatus: {
            select: {
              region: true,
            },
          },
        },
      },
    },
  });

  return summaries
    .map((summary) => {
      // sometimes user can change their region. This flips the user region if it is noticed that
      // they received -2 or +2 from the opposite region. Sometimes user can still have wrong
      // region after this func has ran but this is ok.
      const fixUserRegionIfNeeded = () => {
        if (
          summary.user.plusStatus!.region === "NA" &&
          (summary.countsEU[0] !== 0 || summary.countsEU[3] !== 0)
        )
          return "EU";
        if (
          summary.user.plusStatus!.region === "EU" &&
          (summary.countsNA[0] !== 0 || summary.countsNA[3] !== 0)
        )
          return "NA";

        return summary.user.plusStatus!.region;
      };

      return {
        ...summary,
        regionForVoting: fixUserRegionIfNeeded(),
        percentage: getPercentageFromCounts(
          summary.countsNA,
          summary.countsEU,
          fixUserRegionIfNeeded()
        ),
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .map((summary) => ({
      ...summary,
      percentage: parseFloat(summary.percentage.toFixed(1)),
    }));
};

const getMostRecentVotingWithResultsMonth = async () => {
  const mostRecent = await prisma.plusVotingSummary.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  if (!mostRecent)
    throw Error(
      "unexpected null mostRecent in getMostRecentVotingWithResultsMonth"
    );

  return { year: mostRecent.year, month: mostRecent.month };
};

export default {
  getVotingSummariesByMonthAndTier,
  getMostRecentVotingWithResultsMonth,
};
