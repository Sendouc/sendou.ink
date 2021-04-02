import { Factory } from "fishery";
import { PlusSuggestion } from "@prisma/client";
import prisma from "../client";

export default Factory.define<PlusSuggestion>(({ params, onCreate }) => {
  onCreate((plusSuggestion) => {
    return prisma.plusSuggestion.create({ data: plusSuggestion });
  });

  return {
    suggestedId: 1, // TODO: automatically build a User object, if necessary
    suggesterId: 2, // TODO: automatically build a User object, if necessary
    tier: 1,
    description: "yooo so cracked",
    isResuggestion: false,
    createdAt: new Date(),
  };
});
