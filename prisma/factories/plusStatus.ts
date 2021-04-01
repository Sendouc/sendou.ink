import { Factory } from "fishery";
import { PlusStatus, PlusRegion } from "@prisma/client";
import prisma from "../client";
import _ from "lodash";

export default Factory.define<PlusStatus>(({ params, onCreate }) => {
  onCreate(plusStatus => {
    return prisma.plusStatus.create({ data: plusStatus });
  });

  return {
    userId: 1, // TODO: automatically build a User object, if necessary
    membershipTier: 1,
    region: _.sample(Object.values(PlusRegion))!,
    voucherId: null,
    vouchTier: null,
    canVouchFor: null,
    canVouchAgainAfter: null,
    nameForVoting: null
  };
});
