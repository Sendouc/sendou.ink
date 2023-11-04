import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useMatches, useParams } from "@remix-run/react";
import { z } from "zod";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Redirect } from "~/components/Redirect";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH, PLUS_TIERS } from "~/constants";
import {
  nextNonCompletedVoting,
  rangeToMonthYear,
} from "~/features/plus-voting/core";
import { requireUser, useUser } from "~/features/auth/core";
import {
  canAddCommentToSuggestionBE,
  canAddCommentToSuggestionFE,
} from "~/permissions";
import { atOrError } from "~/utils/arrays";
import { parseRequestFormData, validate } from "~/utils/remix";
import { plusSuggestionPage } from "~/utils/urls";
import { actualNumber, trimmedString } from "~/utils/zod";
import type { PlusSuggestionsLoaderData } from "./plus.suggestions";
import { CommentTextarea } from "./plus.suggestions.new";
import * as PlusSuggestionRepository from "~/features/plus-suggestions/PlusSuggestionRepository.server";

const commentActionSchema = z.object({
  comment: z.preprocess(
    trimmedString,
    z.string().min(1).max(PlUS_SUGGESTION_COMMENT_MAX_LENGTH),
  ),
  tier: z.preprocess(
    actualNumber,
    z
      .number()
      .min(Math.min(...PLUS_TIERS))
      .max(Math.max(...PLUS_TIERS)),
  ),
  suggestedId: z.preprocess(actualNumber, z.number()),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: commentActionSchema,
  });
  const user = await requireUser(request);

  const votingMonthYear = rangeToMonthYear(nextNonCompletedVoting(new Date()));

  const suggestions =
    await PlusSuggestionRepository.findAllByMonth(votingMonthYear);

  validate(suggestions);
  validate(
    canAddCommentToSuggestionBE({
      suggestions,
      user,
      suggested: { id: data.suggestedId },
      targetPlusTier: data.tier,
    }),
  );

  await PlusSuggestionRepository.create({
    authorId: user.id,
    suggestedId: data.suggestedId,
    text: data.comment,
    tier: data.tier,
    ...votingMonthYear,
  });

  throw redirect(plusSuggestionPage(data.tier));
};

export default function PlusCommentModalPage() {
  const user = useUser();
  const matches = useMatches();
  const params = useParams();
  const data = atOrError(matches, -2).data as PlusSuggestionsLoaderData;

  const targetUserId = Number(params["userId"]);
  const tierSuggestedTo = String(params["tier"]);

  const userBeingCommented = data.suggestions.find(
    (suggestion) =>
      suggestion.tier === Number(tierSuggestedTo) &&
      suggestion.suggested.id === targetUserId,
  );

  if (
    !data.suggestions ||
    !userBeingCommented ||
    !canAddCommentToSuggestionFE({
      user,
      suggestions: data.suggestions,
      suggested: { id: targetUserId },
      targetPlusTier: Number(tierSuggestedTo),
    })
  ) {
    return <Redirect to={plusSuggestionPage()} />;
  }

  return (
    <Dialog isOpen>
      <Form method="post" className="stack md">
        <input type="hidden" name="tier" value={tierSuggestedTo} />
        <input type="hidden" name="suggestedId" value={targetUserId} />
        <h2 className="plus__modal-title">
          {userBeingCommented.suggested.discordName}&apos;s +{tierSuggestedTo}{" "}
          suggestion
        </h2>
        <CommentTextarea maxLength={PlUS_SUGGESTION_COMMENT_MAX_LENGTH} />
        <div className="plus__modal-buttons">
          <Button type="submit">Submit</Button>
          <LinkButton
            to={plusSuggestionPage()}
            variant="minimal-destructive"
            size="tiny"
          >
            Cancel
          </LinkButton>
        </div>
      </Form>
    </Dialog>
  );
}
