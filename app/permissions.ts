import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import { monthsVotingRange } from "./core/plus";
import type { User } from "./db/types";
import { allTruthy } from "./utils/arrays";

// TODO: 1) move "root checkers" to one file and utils to one file 2) make utils const for more terseness

interface CanAddCommentToSuggestionArgs {
  user?: Pick<User, "id" | "plusTier">;
  suggestions: plusSuggestions.FindVisibleForUser;
  suggested: Pick<User, "id">;
  targetPlusTier: NonNullable<User["plusTier"]>;
}
export function canAddCommentToSuggestionFE(
  args: CanAddCommentToSuggestionArgs
) {
  return allTruthy([
    !alreadyCommentedByUser(args),
    isPlusServerMember(args.user),
  ]);
}

export function canAddCommentToSuggestionBE({
  user,
  suggestions,
  suggested,
  targetPlusTier,
}: CanAddCommentToSuggestionArgs) {
  return allTruthy([
    canAddCommentToSuggestionFE({
      user,
      suggestions,
      suggested,
      targetPlusTier,
    }),
    playerAlreadySuggested({ suggestions, suggested, targetPlusTier }),
    targetPlusTierIsSmallerOrEqual({ user, targetPlusTier }),
  ]);
}

interface CanDeleteCommentArgs {
  author: Pick<User, "id">;
  user?: Pick<User, "id">;
}
export function canDeleteComment(args: CanDeleteCommentArgs) {
  return isOwnComment(args);
}

function alreadyCommentedByUser({
  user,
  suggestions,
  suggested,
  targetPlusTier,
}: CanAddCommentToSuggestionArgs) {
  return Boolean(
    suggestions[targetPlusTier]
      ?.find((u) => u.info.id === suggested.id)
      ?.suggestions.some((s) => s.author.id === user?.id)
  );
}

function playerAlreadySuggested({
  suggestions,
  suggested,
  targetPlusTier,
}: Pick<
  CanAddCommentToSuggestionArgs,
  "suggestions" | "suggested" | "targetPlusTier"
>) {
  return Boolean(
    suggestions[targetPlusTier]?.find((u) => u.info.id === suggested.id)
  );
}

function targetPlusTierIsSmallerOrEqual({
  user,
  targetPlusTier,
}: Pick<CanAddCommentToSuggestionArgs, "user" | "targetPlusTier">) {
  return user?.plusTier && user.plusTier <= targetPlusTier;
}

function isOwnComment({ author, user }: CanDeleteCommentArgs) {
  return author.id === user?.id;
}

interface CanSuggestNewUserFEArgs {
  user?: Pick<User, "id" | "plusTier">;
  suggestions: plusSuggestions.FindVisibleForUser;
}
export function canSuggestNewUserFE({
  user,
  suggestions,
}: CanSuggestNewUserFEArgs) {
  return allTruthy([
    !votingIsActive(),
    !hasUserSuggestedThisMonth({ user, suggestions }),
    isPlusServerMember(user),
  ]);
}

interface CanSuggestNewUserBEArgs extends CanSuggestNewUserFEArgs {
  suggested: { id: User["id"]; currentPlusTier: User["plusTier"] };
  targetPlusTier: NonNullable<User["plusTier"]>;
}
export function canSuggestNewUserBE({
  user,
  suggestions,
  suggested,
  targetPlusTier,
}: CanSuggestNewUserBEArgs) {
  return allTruthy([
    canSuggestNewUserFE({ user, suggestions }),
    !playerAlreadySuggested({ suggestions, suggested, targetPlusTier }),
    targetPlusTierIsSmallerOrEqual({ user, targetPlusTier }),
    !playerAlreadyMember({ suggested, targetPlusTier }),
  ]);
}

function votingIsActive() {
  const now = new Date();
  const { endDate, startDate } = monthsVotingRange({
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  return (
    now.getTime() >= startDate.getTime() && now.getTime() <= endDate.getTime()
  );
}

function isPlusServerMember(user?: Pick<User, "plusTier">) {
  return Boolean(user?.plusTier);
}

function playerAlreadyMember({
  suggested,
  targetPlusTier,
}: Pick<CanSuggestNewUserBEArgs, "suggested" | "targetPlusTier">) {
  return (
    suggested.currentPlusTier && suggested.currentPlusTier <= targetPlusTier
  );
}

function hasUserSuggestedThisMonth({
  user,
  suggestions,
}: Pick<CanSuggestNewUserFEArgs, "user" | "suggestions">) {
  return Object.values(suggestions)
    .flat()
    .some(({ suggestions }) => suggestions[0].author.id === user?.id);
}
