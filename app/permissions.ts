import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import { monthsVotingRange } from "./core/plus";
import type { User } from "./db/types";
import { allTruthy } from "./utils/arrays";

interface CanAddCommentToSuggestionFEArgs {
  user?: Pick<User, "id" | "plusTier">;
  suggestions: plusSuggestions.FindVisibleForUser;
  suggested: { id: User["id"]; plusTier: NonNullable<User["plusTier"]> };
}
export function canAddCommentToSuggestionFE(
  args: CanAddCommentToSuggestionFEArgs
) {
  return allTruthy([
    !alreadyCommentedByUser(args),
    isPlusServerMember(args.user),
  ]);
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

function alreadyCommentedByUser({
  user,
  suggestions,
  suggested,
}: CanAddCommentToSuggestionFEArgs) {
  return Boolean(
    suggestions[suggested.plusTier]
      ?.find((u) => u.info.id === suggested.id)
      ?.suggestions.some((s) => s.author.id === user?.id)
  );
}

function playerAlreadySuggested({
  suggestions,
  suggested,
}: Pick<CanAddCommentToSuggestionBEArgs, "suggestions" | "suggested">) {
  return Boolean(
    suggestions[suggested.plusTier]?.find((u) => u.info.id === suggested.id)
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

interface CanAddNewSuggestionsFEArgs {
  user?: Pick<User, "id" | "plusTier">;
  suggestions: plusSuggestions.FindVisibleForUser;
}
export function canAddNewSuggestionFE({
  user,
  suggestions,
}: CanAddNewSuggestionsFEArgs) {
  return allTruthy([
    !votingIsActive(),
    !hasUserSuggestedThisMonth({ user, suggestions }),
    isPlusServerMember(user),
  ]);
}

interface CanAddNewSuggestionsBEArgs extends CanAddNewSuggestionsFEArgs {
  suggested: { id: User["id"]; plusTier: NonNullable<User["plusTier"]> };
}
export function canAddNewSuggestionBE({
  user,
  suggestions,
  suggested,
}: CanAddNewSuggestionsBEArgs) {
  return allTruthy([
    canAddNewSuggestionFE({ user, suggestions }),
    !playerAlreadySuggested({ suggestions, suggested }),
    targetPlusTierIsSmallerOrEqual({ user, suggested }),
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

function hasUserSuggestedThisMonth({
  user,
  suggestions,
}: Pick<CanAddNewSuggestionsFEArgs, "user" | "suggestions">) {
  return Object.values(suggestions)
    .flat()
    .some(({ suggestions }) => suggestions[0].author.id === user?.id);
}
