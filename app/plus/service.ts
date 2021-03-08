import { Prisma } from "@prisma/client";
import { httpError } from "@trpc/server";
import prisma from "prisma/client";
import { getPercentageFromCounts, getVotingRange } from "utils/plus";
import { userBasicSelection } from "utils/prisma";
import { suggestionFullSchema } from "utils/validators/suggestion";
import { vouchSchema } from "utils/validators/vouch";
import * as z from "zod";

export type PlusStatuses = Prisma.PromiseReturnType<typeof getPlusStatuses>;

const getPlusStatuses = async () => {
  return prisma.plusStatus.findMany({
    select: {
      canVouchAgainAfter: true,
      vouchTier: true,
      canVouchFor: true,
      membershipTier: true,
      region: true,
      voucher: { select: userBasicSelection },
      user: { select: userBasicSelection },
    },
  });
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
  input,
  userId,
}: {
  input: z.infer<typeof suggestionFullSchema>;
  userId: number;
}) => {
  const [suggestions, plusStatuses] = await Promise.all([
    prisma.plusSuggestion.findMany({}),
    prisma.plusStatus.findMany({}),
  ]);
  const existingSuggestion = suggestions.find(
    ({ tier, suggestedId }) =>
      tier === input.tier && suggestedId === input.suggestedId
  );

  // every user can only send one new suggestion per month
  if (!existingSuggestion) {
    const usersSuggestion = suggestions.find(
      ({ isResuggestion, suggesterId }) =>
        isResuggestion === false && suggesterId === userId
    );
    if (usersSuggestion) {
      httpError.badRequest("already made a new suggestion");
    }
  }

  const suggesterPlusStatus = plusStatuses.find(
    (status) => status.userId === userId
  );

  if (
    !suggesterPlusStatus ||
    !suggesterPlusStatus.membershipTier ||
    suggesterPlusStatus.membershipTier > input.tier
  ) {
    httpError.badRequest(
      "not a member of high enough tier to suggest for this tier"
    );
  }

  if (suggestedUserAlreadyHasAccess()) {
    throw httpError.badRequest("suggested user already has access");
  }

  if (getVotingRange().isHappening) {
    httpError.badRequest("voting has already started");
  }

  return prisma.$transaction([
    prisma.plusSuggestion.create({
      data: {
        ...input,
        suggesterId: userId,
        isResuggestion: !!existingSuggestion,
      },
    }),
    prisma.plusStatus.upsert({
      where: { userId: input.suggestedId },
      create: { region: input.region, userId: input.suggestedId },
      update: {},
    }),
  ]);

  function suggestedUserAlreadyHasAccess() {
    const suggestedPlusStatus = plusStatuses.find(
      (status) => status.userId === input.suggestedId
    );
    return Boolean(
      suggestedPlusStatus &&
        ((suggestedPlusStatus.membershipTier ?? 999) <= input.tier ||
          (suggestedPlusStatus.vouchTier ?? 999) <= input.tier)
    );
  }
};

const addVouch = async ({
  input,
  userId,
}: {
  input: z.infer<typeof vouchSchema>;
  userId: number;
}) => {
  const plusStatuses = await prisma.plusStatus.findMany({});

  const suggesterPlusStatus = plusStatuses.find(
    (status) => status.userId === userId
  );

  if ((suggesterPlusStatus?.canVouchFor ?? Infinity) > input.tier) {
    httpError.badRequest(
      "not a member of high enough tier to vouch for this tier"
    );
  }

  if (vouchedUserAlreadyHasAccess()) {
    httpError.badRequest("vouched user already has access");
  }

  if (getVotingRange().isHappening) {
    httpError.badRequest("voting has already started");
  }

  return prisma.$transaction([
    prisma.plusStatus.upsert({
      where: { userId: input.vouchedId },
      create: { region: input.region, userId: input.vouchedId },
      update: { voucherId: userId, vouchTier: input.tier },
    }),
    prisma.plusStatus.update({
      where: { userId },
      data: { canVouchFor: null },
    }),
  ]);

  function vouchedUserAlreadyHasAccess() {
    const suggestedPlusStatus = plusStatuses.find(
      (status) => status.userId === input.vouchedId
    );
    return Boolean(
      suggestedPlusStatus &&
        ((suggestedPlusStatus.membershipTier ?? 999) <= input.tier ||
          (suggestedPlusStatus.vouchTier ?? 999) <= input.tier)
    );
  }
};

export default {
  getPlusStatuses,
  getSuggestions,
  getVotingSummariesByMonthAndTier,
  getMostRecentVotingWithResultsMonth,
  getDistinctSummaryMonths,
  addSuggestion,
  addVouch,
};
