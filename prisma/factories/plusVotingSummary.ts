import { Factory } from "fishery";
import { PlusVotingSummary } from "@prisma/client";
import prisma from "../client";

export default Factory.define<PlusVotingSummary>(({ params, onCreate }) => {
  onCreate(plusVotingSummary => {
    return prisma.plusVotingSummary.create({ data: plusVotingSummary });
  });

  return {
    userId: 1, // TODO: automatically build a User object, if necessary
    month: 1,
    tier: 1,
    year: 2020,
    wasVouched: false,
    wasSuggested: false,
    countsEU: [0, 0, 0, 3],
    countsNA: [0, 0, 2, 0]
  };
});
