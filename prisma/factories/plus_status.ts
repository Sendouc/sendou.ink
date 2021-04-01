import { Factory } from "fishery";
import { PlusStatus, PlusRegion } from "@prisma/client";
import prisma from "../client";
import userFactory from './user';
import _ from "lodash";

export default Factory.define<PlusStatus>(({ params, onCreate }) => {
  onCreate(plusStatus => {
    return prisma.plusStatus.create({ data: plusStatus });
  });

  return {
    userId: userFactory.build().id,
    membershipTier: 1,
    region: _.sample(Object.values(PlusRegion))!,
    voucherId: null,
    vouchTier: null,
    canVouchFor: null,
    canVouchAgainAfter: null,
    nameForVoting: null
  };
});
