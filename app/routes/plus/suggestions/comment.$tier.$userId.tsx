import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useMatches, useNavigate, useParams } from "@remix-run/react";
import { z } from "zod";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Redirect } from "~/components/Redirect";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH } from "~/constants";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";
import { useUser } from "~/hooks/useUser";
import {
  canAddCommentToSuggestionBE,
  canAddCommentToSuggestionFE,
} from "~/permissions";
import { parseRequestFormData, requireUser, validate } from "~/utils/remix";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import { actualNumber } from "~/utils/zod";
import type { PlusSuggestionsLoaderData } from "../suggestions";
import { CommentTextarea } from "./new";

const commentActionSchema = z.object({
  text: z.string().min(1).max(PlUS_SUGGESTION_COMMENT_MAX_LENGTH),
  tier: z.preprocess(actualNumber, z.number().min(1).max(3)),
  suggestedId: z.preprocess(actualNumber, z.number()),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: commentActionSchema,
  });
  const user = await requireUser(request);

  const suggestions = db.plusSuggestions.findVisibleForUser({
    ...upcomingVoting(new Date()),
    plusTier: user.plusTier,
  });

  validate(suggestions);
  validate(
    canAddCommentToSuggestionBE({
      suggestions,
      user,
      suggested: { id: data.suggestedId, plusTier: data.tier },
    })
  );

  db.plusSuggestions.create({
    authorId: user.id,
    ...data,
    ...upcomingVoting(new Date()),
  });

  return redirect(PLUS_SUGGESTIONS_PAGE);
};

export default function PlusCommentModalPage() {
  const user = useUser();
  const matches = useMatches();
  const navigate = useNavigate();
  const params = useParams();
  const data = matches.at(-2)!.data as PlusSuggestionsLoaderData;

  const targetUserId = Number(params.userId);
  const tierSuggestedTo = String(params.tier);

  const userBeingCommented = data.suggestions?.[tierSuggestedTo]?.find(
    (u) => u.info.id === targetUserId
  );

  if (
    !data.suggestions ||
    !userBeingCommented ||
    !canAddCommentToSuggestionFE({
      user,
      suggestions: data.suggestions,
      suggested: { id: targetUserId, plusTier: Number(tierSuggestedTo) },
    })
  ) {
    return <Redirect to={PLUS_SUGGESTIONS_PAGE} />;
  }

  return (
    <Dialog className="plus__modal" isOpen>
      <Form method="post" className="stack md">
        <input type="hidden" name="tier" value={tierSuggestedTo} />
        <input type="hidden" name="suggestedId" value={targetUserId} />
        <h2 className="plus__modal-title">
          {userBeingCommented.info.discordName}&apos;s +{tierSuggestedTo}{" "}
          suggestion
        </h2>
        <CommentTextarea />
        <div className="plus__modal-buttons">
          <Button type="submit" data-cy="submit-button">
            Submit
          </Button>
          <LinkButton
            to={PLUS_SUGGESTIONS_PAGE}
            variant="minimal-destructive"
            tiny
          >
            Cancel
          </LinkButton>
        </div>
      </Form>
    </Dialog>
  );
}
