import { Prisma } from "@prisma/client";

export const getPlusStatusesData = (): Prisma.PlusStatusCreateManyInput[] => {
  return [
    {
      userId: 1,
      region: "EU",
      membershipTier: 1,
      canVouchAgainAfter: new Date(Date.UTC(2020, 1, 1)),
    },
    {
      userId: 2,
      region: "NA",
      membershipTier: 1,
    },
    {
      userId: 3,
      region: "EU",
      membershipTier: 1,
    },
    {
      userId: 4,
      region: "NA",
      membershipTier: 1,
    },
    {
      userId: 5,
      region: "EU",
      membershipTier: 1,
    },
    {
      userId: 6,
      region: "NA",
      membershipTier: 2,
      vouchTier: 1,
    },
    {
      userId: 7,
      region: "EU",
      membershipTier: 2,
    },
    {
      userId: 8,
      region: "NA",
      membershipTier: 2,
    },
    {
      userId: 9,
      region: "EU",
      membershipTier: 2,
    },
  ];
};

export const getPlusSuggestionsData = (): Prisma.PlusSuggestionCreateManyInput[] => {
  return [
    {
      description: "yooo so cracked",
      region: "NA",
      tier: 2,
      suggestedId: 10,
      suggesterId: 1,
    },
  ];
};

export const getPlusVotingSummaryData = (): Prisma.PlusVotingSummaryCreateManyInput[] => {
  return [
    {
      userId: 1,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [0, 0, 0, 3],
      countsNA: [0, 0, 2, 0],
    },
    {
      userId: 2,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [3, 0, 0, 0],
      countsNA: [0, 2, 0, 0],
    },
    {
      userId: 3,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [1, 1, 1, 0],
      countsNA: [0, 1, 1, 0],
    },
    {
      userId: 4,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [1, 0, 1, 1],
      countsNA: [0, 2, 0, 0],
    },
    {
      userId: 5,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [1, 0, 1, 1],
      countsNA: [0, 2, 0, 0],
    },
    {
      userId: 6,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: true,
      year: 2020,
      countsEU: [3, 0, 0, 0],
      countsNA: [0, 2, 0, 0],
    },
    {
      userId: 7,
      month: 1,
      scoreTotal: -1,
      tier: 1,
      wasSuggested: false,
      wasVouched: true,
      year: 2020,
      countsEU: [0, 0, 0, 3],
      countsNA: [0, 0, 2, 0],
    },
    // +2
    {
      userId: 6,
      month: 1,
      scoreTotal: -1,
      tier: 2,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [0, 0, 0, 2],
      countsNA: [0, 0, 2, 0],
    },

    {
      userId: 7,
      month: 1,
      scoreTotal: -1,
      tier: 2,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [0, 1, 0, 1],
      countsNA: [0, 1, 1, 0],
    },
    {
      userId: 8,
      month: 1,
      scoreTotal: -1,
      tier: 2,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [0, 2, 0, 0],
      countsNA: [0, 0, 2, 0],
    },
    {
      userId: 9,
      month: 1,
      scoreTotal: -1,
      tier: 2,
      wasSuggested: false,
      wasVouched: false,
      year: 2020,
      countsEU: [1, 1, 0, 0],
      countsNA: [0, 2, 0, 0],
    },
    {
      userId: 10,
      month: 1,
      scoreTotal: -1,
      tier: 2,
      wasSuggested: true,
      wasVouched: false,
      year: 2020,
      countsEU: [0, 0, 0, 2],
      countsNA: [0, 0, 2, 0],
    },
  ];
};
