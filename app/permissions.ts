import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import type { User } from "./db/types";
import { allTruthy } from "./utils/arrays";

interface CanAddCommentToSuggestionFEArgs {
  user?: Pick<User, "id">;
  allSuggestions: plusSuggestions.FindResult;
  target: Pick<User, "id" | "plusTier">;
}
export function canAddCommentToSuggestionFE(
  args: CanAddCommentToSuggestionFEArgs
) {
  return !alreadyCommentedByUser(args);
}

interface CanAddCommentToSuggestionBEArgs
  extends CanAddCommentToSuggestionFEArgs {
  user?: Pick<User, "id" | "plusTier">;
  targetPlusTier: number;
}
export function canAddCommentToSuggestionBE({
  user,
  targetPlusTier,
  allSuggestions,
  target,
}: CanAddCommentToSuggestionBEArgs) {
  return allTruthy([
    canAddCommentToSuggestionFE({ user, allSuggestions, target }),
    playerAlreadySuggested({ allSuggestions, target }),
    targetPlusTierIsSmallerOrEqual({ user, targetPlusTier }),
  ]);
}

// TODO: needed for new suggestions
// function votingIsActive() {
//   const now = new Date();
//   const { endDate, startDate } = monthsVotingRange({
//     month: now.getMonth(),
//     year: now.getFullYear(),
//   });

//   return (
//     now.getTime() >= startDate.getTime() && now.getTime() <= endDate.getTime()
//   );
// }

function alreadyCommentedByUser({
  user,
  allSuggestions,
  target,
}: CanAddCommentToSuggestionFEArgs) {
  return Boolean(
    allSuggestions
      .find(({ tier }) => tier === target.plusTier)
      ?.users.find((u) => u.info.id === target.id)
      ?.suggestions.some((s) => s.author.id === user?.id)
  );
}

function playerAlreadySuggested({
  allSuggestions,
  target,
}: Pick<CanAddCommentToSuggestionBEArgs, "allSuggestions" | "target">) {
  return Boolean(
    allSuggestions
      .find(({ tier }) => tier === target.plusTier)
      ?.users.find((u) => u.info.id === target.id)
  );
}

function targetPlusTierIsSmallerOrEqual({
  user,
  targetPlusTier,
}: Pick<CanAddCommentToSuggestionBEArgs, "user" | "targetPlusTier">) {
  return user?.plusTier && user.plusTier <= targetPlusTier;
}
