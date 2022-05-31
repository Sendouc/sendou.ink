import { Form, useMatches } from "@remix-run/react";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Redirect } from "~/components/Redirect";
import { useUser } from "~/hooks/useUser";
import { canAddNewSuggestionBE, canAddNewSuggestionFE } from "~/permissions";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import type { PlusSuggestionsLoaderData } from "../suggestions";
import * as React from "react";
import { Label } from "~/components/Label";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH, PLUS_TIERS } from "~/constants";
import invariant from "tiny-invariant";
import { UserCombobox } from "~/components/Combobox";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import { actualNumber } from "~/utils/zod";
import { parseRequestFormData, requireUser, validate } from "~/utils/remix";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";

const commentActionSchema = z.object({
  tier: z.preprocess(actualNumber, z.number().min(1).max(3)),
  text: z.string().min(1).max(PlUS_SUGGESTION_COMMENT_MAX_LENGTH),
  "user[value]": z.preprocess(actualNumber, z.number().positive()),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: commentActionSchema,
  });
  const suggestedId = data["user[value]"];

  const user = await requireUser(request);

  const suggestions = db.plusSuggestions.findVisibleForUser({
    ...upcomingVoting(new Date()),
    plusTier: user.plusTier,
  });

  validate(suggestions);
  validate(
    canAddNewSuggestionBE({
      user,
      suggested: { id: suggestedId, plusTier: data.tier },
      suggestions,
    })
  );

  db.plusSuggestions.create({
    authorId: user.id,
    suggestedId,
    tier: data.tier,
    text: data.text,
    ...upcomingVoting(new Date()),
  });

  return redirect(PLUS_SUGGESTIONS_PAGE);
};

export default function PlusNewSuggestionModalPage() {
  const user = useUser();
  const matches = useMatches();
  const data = matches.at(-2)!.data as PlusSuggestionsLoaderData;

  if (
    !data.suggestions ||
    !canAddNewSuggestionFE({
      user,
      suggestions: data.suggestions,
    })
  ) {
    return <Redirect to={PLUS_SUGGESTIONS_PAGE} />;
  }

  return (
    <Dialog className="plus__modal" isOpen>
      <Form method="post" className="stack md">
        <h2 className="plus__modal-title">Adding a new suggestion</h2>
        <div>
          <label htmlFor="tier">Tier</label>
          <select id="tier" name="tier" className="plus__modal-select">
            {PLUS_TIERS.filter((tier) => {
              invariant(user?.plusTier);
              return tier >= user.plusTier;
            }).map((tier) => (
              <option key={tier}>+{tier}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="user">Suggested user</label>
          <UserCombobox inputName="user" />
        </div>
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

function validateSelectedUser():
  | "OK"
  | "ALREADY_PLUS_MEMBER"
  | "ALREADY_SUGGESTED" {
  return "OK";
}

export function CommentTextarea() {
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
        required
      />
    </div>
  );
}
