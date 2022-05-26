import {
  Form,
  useMatches,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { Button } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Label } from "~/components/Label";
import { Redirect } from "~/components/Redirect";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import type { PlusSuggestionsLoaderData } from "../suggestions";
import * as React from "react";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH } from "~/constants";
import type { ActionFunction } from "@remix-run/node";
import { z } from "zod";
import { parseRequestFormData, requireUser } from "~/utils/remix";
import { canAddCommentToSuggestionFE } from "~/permissions";
import { useUser } from "~/hooks/useUser";

const commentActionSchema = z.object({
  comment: z.string().max(PlUS_SUGGESTION_COMMENT_MAX_LENGTH),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: commentActionSchema,
  });
  const user = await requireUser(request);

  return null;
};

export default function PlusCommentModalPage() {
  const user = useUser();
  const matches = useMatches();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const data = matches.at(-2)!.data as PlusSuggestionsLoaderData;

  const userBeingCommentedId = Number(searchParams.get("id"));
  const tierSuggestedTo = Number(searchParams.get("tier"));

  const userBeingCommented = data.suggestions
    ?.find(({ tier }) => tier === tierSuggestedTo)
    ?.users.find((u) => u.info.id === userBeingCommentedId);

  if (
    !userBeingCommented ||
    !canAddCommentToSuggestionFE({
      user,
      allSuggestions: data.suggestions!,
      target: { id: userBeingCommentedId, plusTier: tierSuggestedTo },
    })
  ) {
    return <Redirect to={PLUS_SUGGESTIONS_PAGE} />;
  }

  return (
    <Dialog className="plus__modal" isOpen>
      <Form method="post" className="stack md">
        <h2 className="plus__modal-title">
          {userBeingCommented.info.discordName}&apos;s +{tierSuggestedTo}{" "}
          suggestion
        </h2>
        <CommentTextarea />
        <div className="plus__modal-buttons">
          <Button type="submit">Submit</Button>
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
        htmlFor="comment"
        valueLimits={{
          current: value.length,
          max: PlUS_SUGGESTION_COMMENT_MAX_LENGTH,
        }}
      >
        Your comment
      </Label>
      <textarea
        id="comment"
        name="comment"
        className="plus__modal-textarea"
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={PlUS_SUGGESTION_COMMENT_MAX_LENGTH}
      />
    </div>
  );
}
