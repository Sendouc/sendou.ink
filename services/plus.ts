import { Prisma } from "@prisma/client";
import { UserError } from "lib/errors";
import { getPercentageFromCounts } from "lib/plus";
import { userBasicSelection } from "lib/prisma";
import { suggestionFullSchema } from "lib/validators/suggestion";
import prisma from "prisma/client";

export type PlusStatus = Prisma.PromiseReturnType<typeof getPlusStatus>;

const getPlusStatus = async (userId: number) => {
  const status = await prisma.plusStatus.findUnique({
    where: { userId },
    select: {
      canVouchAgainAfter: true,
      vouchTier: true,
      canVouchFor: true,
      membershipTier: true,
      region: true,
      voucher: { select: userBasicSelection },
    },
  });

  return { status: status ?? null };
};

export type Suggestions = Prisma.PromiseReturnType<typeof getSuggestions>;

type RawSuggestion = Prisma.PromiseReturnType<typeof getRawSuggestions>;

const getRawSuggestions = async () =>
  prisma.plusSuggestion.findMany({
    select: {
      createdAt: true,
      description: true,
      isResuggestion: true,
      tier: true,
      suggestedUser: { select: userBasicSelection },
      suggesterUser: { select: userBasicSelection },
    },
    orderBy: { createdAt: "desc" },
  });

const getSuggestions = async () => {
  const suggestions = await getRawSuggestions();

  const suggestionDescriptions = suggestions
    .filter((suggestion) => suggestion.isResuggestion)
    .reduce(
      (descriptions: Partial<Record<string, RawSuggestion>>, suggestion) => {
        const key = suggestion.suggestedUser.id + "_" + suggestion.tier;
        if (!descriptions[key]) descriptions[key] = [];

        descriptions[key]!.push(suggestion);

        return descriptions;
      },
      {}
    );

  return suggestions
    .filter((suggestion) => !suggestion.isResuggestion)
    .map((suggestion) => ({
      ...suggestion,
      resuggestions:
        suggestionDescriptions[
          suggestion.suggestedUser.id + "_" + suggestion.tier
        ],
    }));
};

export type VotingSummariesByMonthAndTier = Prisma.PromiseReturnType<
  typeof getVotingSummariesByMonthAndTier
>;

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
        const region = summary.user.plusStatus?.region ?? "NA";
        if (
          region === "NA" &&
          (summary.countsEU[0] !== 0 || summary.countsEU[3] !== 0)
        )
          return "EU";
        if (
          region === "EU" &&
          (summary.countsNA[0] !== 0 || summary.countsNA[3] !== 0)
        )
          return "NA";

        return region;
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

export type DistinctSummaryMonths = Prisma.PromiseReturnType<
  typeof getDistinctSummaryMonths
>;

const getDistinctSummaryMonths = () => {
  return prisma.plusVotingSummary.findMany({
    distinct: ["month", "year", "tier"],
    select: { month: true, year: true, tier: true },
    orderBy: [{ year: "desc" }, { month: "desc" }, { tier: "asc" }],
  });
};

const addSuggestion = async ({
  data,
  userId,
}: {
  data: unknown;
  userId: number;
}) => {
  const parsedData = {
    ...suggestionFullSchema.parse(data),
    suggesterId: userId,
  };
  const [suggestions, plusStatuses] = await Promise.all([
    prisma.plusSuggestion.findMany({}),
    prisma.plusStatus.findMany({}),
  ]);
  const existingSuggestion = suggestions.find(
    ({ tier, suggestedId }) =>
      tier === parsedData.tier && suggestedId === parsedData.suggestedId
  );

  // every user can only send one new suggestion per month
  if (!existingSuggestion) {
    const usersSuggestion = suggestions.find(
      ({ isResuggestion, suggesterId }) =>
        isResuggestion === false && suggesterId === userId
    );
    if (usersSuggestion) {
      throw new UserError("already made a new suggestion");
    }
  }

  const suggesterPlusStatus = plusStatuses.find(
    (status) => status.userId === userId
  );

  if (
    !suggesterPlusStatus ||
    !suggesterPlusStatus.membershipTier ||
    suggesterPlusStatus.membershipTier > parsedData.tier
  ) {
    throw new UserError(
      "not a member of high enough tier to suggest for this tier"
    );
  }

  if (suggestedUserAlreadyHasAccess()) {
    throw new UserError("suggested user already has access");
  }

  // TODO voting has started

  return prisma.$transaction([
    prisma.plusSuggestion.create({
      data: { ...parsedData, isResuggestion: !!existingSuggestion },
    }),
    prisma.plusStatus.upsert({
      where: { userId: parsedData.suggestedId },
      create: { region: parsedData.region, userId: parsedData.suggestedId },
      update: {},
    }),
  ]);

  function suggestedUserAlreadyHasAccess() {
    const suggestedPlusStatus = plusStatuses.find(
      (status) => status.userId === parsedData.suggestedId
    );
    return Boolean(
      suggestedPlusStatus &&
        ((suggestedPlusStatus.membershipTier ?? 999) <= parsedData.tier ||
          (suggestedPlusStatus.vouchTier ?? 999) <= parsedData.tier)
    );
  }
};

export default {
  getPlusStatus,
  getSuggestions,
  getVotingSummariesByMonthAndTier,
  getMostRecentVotingWithResultsMonth,
  getDistinctSummaryMonths,
  addSuggestion,
};
