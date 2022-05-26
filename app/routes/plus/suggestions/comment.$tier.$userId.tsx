import { Form, useMatches, useNavigate, useParams } from "@remix-run/react";
import { Button } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Label } from "~/components/Label";
import { Redirect } from "~/components/Redirect";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import type { PlusSuggestionsLoaderData } from "../suggestions";
import * as React from "react";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH } from "~/constants";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import { parseRequestFormData, requireUser, validate } from "~/utils/remix";
import {
  canAddCommentToSuggestionBE,
  canAddCommentToSuggestionFE,
} from "~/permissions";
import { useUser } from "~/hooks/useUser";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";
import { actualNumber } from "~/utils/zod";
import invariant from "tiny-invariant";

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

  const suggestions = db.plusSuggestions.find({
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
  const tierSuggestedTo = Number(params.tier);

  const userBeingCommented = data.suggestions
    ?.find(({ tier }) => tier === tierSuggestedTo)
    ?.users.find((u) => u.info.id === targetUserId);

  invariant(data.suggestions);
  if (
    !userBeingCommented ||
    !canAddCommentToSuggestionFE({
      user,
      suggestions: data.suggestions,
      suggested: { id: targetUserId, plusTier: tierSuggestedTo },
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
          <Button
            onClick={() => navigate(PLUS_SUGGESTIONS_PAGE)}
            variant="minimal-destructive"
            tiny
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}

function CommentTextarea() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <Label
        htmlFor="text"
        valueLimits={{
          current: value.length,
          max: PlUS_SUGGESTION_COMMENT_MAX_LENGTH,
        }}
      >
        Your comment
      </Label>
      <textarea
        id="text"
        name="text"
        className="plus__modal-textarea"
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={PlUS_SUGGESTION_COMMENT_MAX_LENGTH}
        data-cy="comment-textarea"
      />
    </div>
  );
}
