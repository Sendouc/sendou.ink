import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import type { User } from "./db/types";
import { allTruthy } from "./utils/arrays";

interface CanAddCommentToSuggestionFEArgs {
  user?: Pick<User, "id">;
  suggestions: plusSuggestions.FindResult;
  suggested: { id: User["id"]; plusTier: NonNullable<User["plusTier"]> };
}
export function canAddCommentToSuggestionFE(
  args: CanAddCommentToSuggestionFEArgs
) {
  return !alreadyCommentedByUser(args);
}

interface CanAddCommentToSuggestionBEArgs
  extends CanAddCommentToSuggestionFEArgs {
  user?: Pick<User, "id" | "plusTier">;
}
export function canAddCommentToSuggestionBE({
  user,
  suggestions,
  suggested,
}: CanAddCommentToSuggestionBEArgs) {
  return allTruthy([
    canAddCommentToSuggestionFE({ user, suggestions, suggested }),
    playerAlreadySuggested({ suggestions, suggested }),
    targetPlusTierIsSmallerOrEqual({ user, suggested }),
  ]);
}

interface CanDeleteCommentArgs {
  author: Pick<User, "id">;
  user?: Pick<User, "id">;
}
export function canDeleteComment(args: CanDeleteCommentArgs) {
  return isOwnComment(args);
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
  suggestions,
  suggested,
}: CanAddCommentToSuggestionFEArgs) {
  return Boolean(
    suggestions
      .find(({ tier }) => tier === suggested.plusTier)
      ?.users.find((u) => u.info.id === suggested.id)
      ?.suggestions.some((s) => s.author.id === user?.id)
  );
}

function playerAlreadySuggested({
  suggestions,
  suggested,
}: Pick<CanAddCommentToSuggestionBEArgs, "suggestions" | "suggested">) {
  return Boolean(
    suggestions
      .find(({ tier }) => tier === suggested.plusTier)
      ?.users.find((u) => u.info.id === suggested.id)
  );
}

function targetPlusTierIsSmallerOrEqual({
  user,
  suggested,
}: Pick<CanAddCommentToSuggestionBEArgs, "user" | "suggested">) {
  return user?.plusTier && user.plusTier <= suggested.plusTier;
}

function isOwnComment({ author, user }: CanDeleteCommentArgs) {
  return author.id === user?.id;
}
