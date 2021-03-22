import { PlusRegion, Prisma } from "@prisma/client";
import { httpError } from "@trpc/server";
import prisma from "prisma/client";
import { ADMIN_ID } from "utils/constants";
import { getPercentageFromCounts, getVotingRange } from "utils/plus";
import { userBasicSelection } from "utils/prisma";
import { shuffleArray } from "utils/shuffleArray";
import { suggestionFullSchema } from "utils/validators/suggestion";
import { voteSchema, votesSchema } from "utils/validators/votes";
import { vouchSchema } from "utils/validators/vouch";
import * as z from "zod";

// null, +1, +2, +3
const VOUCH_CRITERIA = [-1, 90, 85, 80] as const;

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
    .sort((a, b) => b.percentage - a.percentage);
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
          { vouchTier: plusStatus.membershipTier },
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

const votedUserScores = async (userId: number) => {
  const ballots = await prisma.plusBallot.findMany({
    where: { isStale: false, voterId: userId },
  });

  if (ballots.length === 0) {
    return undefined;
  }

  const result = new Map<number, number>();

  for (const ballot of ballots) {
    result.set(ballot.votedId, ballot.score);
  }

  return result;
};

const votingProgress = async () => {
  const [ballots, statuses] = await Promise.all([
    prisma.plusBallot.findMany({
      where: { isStale: false },
      distinct: ["voterId"],
    }),
    prisma.plusStatus.findMany({ where: { NOT: { membershipTier: null } } }),
  ]);

  const result = {
    1: {
      voted: 0,
      totalVoterCount: 0,
    },
    2: {
      voted: 0,
      totalVoterCount: 0,
    },
    3: {
      voted: 0,
      totalVoterCount: 0,
    },
  };

  for (const status of statuses) {
    const key = status.membershipTier as keyof typeof result;
    result[key].totalVoterCount++;

    if (ballots.some((ballot) => ballot.voterId === status.userId)) {
      result[key].voted++;
    }
  }

  return result;
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
      throw httpError.badRequest("already made a new suggestion");
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
    throw httpError.badRequest(
      "not a member of high enough tier to suggest for this tier"
    );
  }

  if (suggestedUserAlreadyHasAccess()) {
    throw httpError.badRequest("suggested user already has access");
  }

  if (getVotingRange().isHappening) {
    throw httpError.badRequest("voting has already started");
  }

  return prisma.$transaction([
    prisma.plusSuggestion.create({
      data: {
        tier: input.tier,
        description: input.description,
        suggestedId: input.suggestedId,
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
  const [plusStatuses, summaries] = await Promise.all([
    prisma.plusStatus.findMany({}),
    prisma.plusVotingSummary.findMany({
      where: { wasSuggested: false },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 500,
    }),
  ]);

  const suggesterPlusStatus = plusStatuses.find(
    (status) => status.userId === userId
  );

  for (const summary of summaries) {
    if (
      summary.year !== summaries[0].year ||
      summary.month !== summaries[0].month
    ) {
      break;
    }

    if (summary.userId === input.vouchedId && summary.tier === input.tier) {
      // can't vouch if they were just kicked
      throw httpError.badRequest(
        "can't vouch the user because they were kicked last month"
      );
    }
  }

  if ((suggesterPlusStatus?.canVouchFor ?? Infinity) > input.tier) {
    throw httpError.badRequest(
      "not a member of high enough tier to vouch for this tier"
    );
  }

  if (vouchedUserAlreadyHasAccess()) {
    throw httpError.badRequest("vouched user already has access");
  }

  if (getVotingRange().isHappening) {
    throw httpError.badRequest("voting has already started");
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
    prisma.plusSuggestion.deleteMany({
      where: { suggestedId: input.vouchedId, tier: input.tier },
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
  if (!getVotingRange().isHappening) {
    throw httpError.badRequest("voting is not happening right now");
  }

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
      if (!region) return true;

      if (region === usersPlusStatus.region) {
        if (![-2, -1, 1, 2].includes(vote.score)) return true;
      } else {
        if (![-1, 1].includes(vote.score)) return true;
      }

      return false;
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

const editVote = async ({
  input,
  userId,
}: {
  input: z.infer<typeof voteSchema>;
  userId: number;
}) => {
  if (!getVotingRange().isHappening) {
    throw httpError.badRequest("voting is not happening right now");
  }

  const statuses = await prisma.plusStatus.findMany({
    where: { userId: { in: [userId, input.userId] } },
  });

  if (
    statuses[0].region !== statuses[1].region &&
    ![-1, 1].includes(input.score)
  ) {
    throw httpError.badRequest("invalid score");
  }

  if (
    statuses[0].region === statuses[1].region &&
    ![-2, -1, 1, 2].includes(input.score)
  ) {
    throw httpError.badRequest("invalid score");
  }

  return prisma.plusBallot.update({
    where: {
      votedId_voterId_isStale: {
        votedId: input.userId,
        voterId: userId,
        isStale: false,
      },
    },
    data: { score: input.score },
  });
};

const endVoting = async (userId: number) => {
  if (userId !== ADMIN_ID) throw httpError.badRequest("not admin");

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
    if (!summary) throw httpError.badRequest("unexpected no summary");

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
      if (!plusStatus)
        throw httpError.badRequest("unexpected no plusStatus in loop");

      const passedVoting =
        getPercentageFromCounts(
          summary.countsNA as number[],
          summary.countsEU as number[],
          plusStatus.region
        ) >= 50;

      if (passedVoting) {
        if (alreadyMember.has(summary.userId)) continue;
        members[tier].push(summary.userId);
        alreadyMember.add(summary.userId);
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
          if (!plusStatus.voucherId)
            throw httpError.badRequest("unexpexted no voucher id");
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

  await Promise.all([
    prisma.plusBallot.deleteMany({ where: { isStale: true } }),
    prisma.plusStatus.updateMany({
      data: { canVouchFor: null },
    }),
  ]);

  const now = new Date();

  return prisma.$transaction([
    prisma.plusBallot.updateMany({ data: { isStale: true } }),
    prisma.plusSuggestion.deleteMany({}),
    prisma.plusVotingSummary.createMany({
      data: [
        ...Array.from(summariesByTier[1].values()),
        ...Array.from(summariesByTier[2].values()),
        ...Array.from(summariesByTier[3].values()),
      ],
    }),
    prisma.plusStatus.updateMany({ data: { vouchTier: null } }),
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
};

export default {
  getPlusStatuses,
  getSuggestions,
  getVotingSummariesByMonthAndTier,
  getMostRecentVotingWithResultsMonth,
  getDistinctSummaryMonths,
  getUsersForVoting,
  votingProgress,
  addSuggestion,
  addVouch,
  addVotes,
  editVote,
  votedUserScores,
  endVoting,
};
