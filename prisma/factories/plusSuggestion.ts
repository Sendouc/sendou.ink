import { Factory } from "fishery";
import { PlusSuggestion } from "@prisma/client";
import prisma from "../client";
import userFactory from './user';

export default Factory.define<PlusSuggestion>(({ params, onCreate }) => {
  onCreate(plusSuggestion => {
    return prisma.plusSuggestion.create({ data: plusSuggestion });
  });

  return {
    suggestedId: userFactory.build().id,
    suggesterId: userFactory.build().id,
    tier: 1,
    description: "yooo so cracked",
    isResuggestion: false,
    createdAt: new Date()
  };
});
