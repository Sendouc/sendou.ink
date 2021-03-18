import { PlusRegion, Prisma } from "@prisma/client";
import { httpError } from "@trpc/server";
import prisma from "prisma/client";
import { getPercentageFromCounts, getVotingRange } from "utils/plus";
import { userBasicSelection } from "utils/prisma";
import { shuffleArray } from "utils/shuffleArray";
import { suggestionFullSchema } from "utils/validators/suggestion";
import { votesSchema } from "utils/validators/votes";
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

const getUsersForVoting = async (userId: number) => {
  if (!getVotingRange().isHappening) return null;
  const plusStatus = await prisma.plusStatus.findUnique({ where: { userId } });

  if (!plusStatus?.membershipTier) return null;

  const [plusStatuses, suggestions] = await Promise.all([
    prisma.plusStatus.findMany({
      where: {
        OR: [
          { membershipTier: plusStatus.membershipTier },
          { membershipTier: plusStatus.membershipTier },
        ],
      },
      include: { user: { include: { profile: true } } },
    }),
    prisma.plusSuggestion.findMany({
      where: { tier: plusStatus.membershipTier },
      include: {
        suggestedUser: { include: { profile: true, plusStatus: true } },
        suggesterUser: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const result: {
    userId: number;
    username: string;
    discriminator: string;
    discordAvatar: string | null;
    discordId: string;
    region: PlusRegion;
    bio?: string | null;
    suggestions?: {
      description: string;
      suggesterUser: {
        id: number;
        username: string;
        discriminator: string;
      };
    }[];
  }[] = [];

  for (const status of plusStatuses) {
    result.push({
      userId: status.user.id,
      username: status.user.username,
      discriminator: status.user.discriminator,
      discordAvatar: status.user.discordAvatar,
      bio: status.user.profile?.bio,
      discordId: status.user.discordId,
      region: status.region,
    });
  }

  for (const suggestion of suggestions) {
    const user = result.find(
      ({ userId }) => userId === suggestion.suggestedUser.id
    );
    if (user) {
      user.suggestions?.push({
        description: suggestion.description,
        suggesterUser: {
          id: suggestion.suggesterUser.id,
          username: suggestion.suggesterUser.username,
          discriminator: suggestion.suggestedUser.discriminator,
        },
      });
      continue;
    }

    result.push({
      userId: suggestion.suggestedUser.id,
      username: suggestion.suggestedUser.username,
      discriminator: suggestion.suggestedUser.discriminator,
      discordAvatar: suggestion.suggestedUser.discordAvatar,
      bio: suggestion.suggestedUser.profile?.bio,
      discordId: suggestion.suggestedUser.discordId,
      region: suggestion.suggestedUser.plusStatus?.region!,
      suggestions: [
        {
          description: suggestion.description,
          suggesterUser: {
            id: suggestion.suggesterUser.id,
            username: suggestion.suggesterUser.username,
            discriminator: suggestion.suggestedUser.discriminator,
          },
        },
      ],
    });
  }

  return shuffleArray(result).sort((a, b) => a.region.localeCompare(b.region));
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

const addVotes = async ({
  input,
  userId,
}: {
  input: z.infer<typeof votesSchema>;
  userId: number;
}) => {
  const [plusStatuses, suggestions] = await Promise.all([
    prisma.plusStatus.findMany({}),
    prisma.plusSuggestion.findMany({ where: { isResuggestion: false } }),
  ]);

  const usersPlusStatus = plusStatuses.find(
    (status) => status.userId === userId
  );

  const usersMembership = usersPlusStatus?.membershipTier;

  if (!usersPlusStatus || !usersMembership)
    throw httpError.badRequest("not a member");

  const allowedUsers = new Map<number, "EU" | "NA">();

  for (const status of plusStatuses) {
    if (
      status.membershipTier !== usersMembership &&
      status.vouchTier !== usersMembership
    ) {
      continue;
    }

    allowedUsers.set(status.userId, status.region);
  }

  for (const suggestion of suggestions) {
    if (suggestion.tier !== usersMembership) {
      continue;
    }

    const status = plusStatuses.find(
      (status) => status.userId === suggestion.suggestedId
    );
    if (!status)
      throw httpError.badRequest("unexpected no status for suggested user");

    allowedUsers.set(suggestion.suggestedId, status.region);
  }

  if (input.length !== allowedUsers.size) {
    throw httpError.badRequest("didn't vote on every user exactly once");
  }

  if (
    input.some((vote) => {
      const region = allowedUsers.get(vote.userId);
      if (!region) return false;

      if (region === usersPlusStatus.region) {
        if (![-2, -1, 1, 2].includes(vote.score)) return false;
      } else {
        if (![-1, 1].includes(vote.score)) return false;
      }

      return true;
    })
  ) {
    throw httpError.badRequest("invalid vote provided");
  }

  return prisma.plusBallot.createMany({
    data: input.map((vote) => {
      return {
        score: vote.score,
        tier: usersMembership,
        voterId: userId,
        votedId: vote.userId,
      };
    }),
  });
};

export default {
  getPlusStatuses,
  getSuggestions,
  getVotingSummariesByMonthAndTier,
  getMostRecentVotingWithResultsMonth,
  getDistinctSummaryMonths,
  getUsersForVoting,
  addSuggestion,
  addVouch,
  addVotes,
};
