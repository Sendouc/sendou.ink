import { PlusStatus } from "@prisma/client";
import { Factory } from "fishery";
import { randomElement } from "utils/arrays";
import prisma from "../client";

export default Factory.define<PlusStatus>(({ params, onCreate }) => {
  onCreate((plusStatus) => {
    return prisma.plusStatus.create({ data: plusStatus });
  });

  return {
    userId: 1, // TODO: automatically build a User object, if necessary
    membershipTier: 1,
    region: randomElement(["EU", "NA"]),
    voucherId: null,
    vouchTier: null,
    canVouchFor: null,
    canVouchAgainAfter: null,
    nameForVoting: null,
  };
});
