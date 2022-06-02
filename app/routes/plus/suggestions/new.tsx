import { Form, useMatches } from "@remix-run/react";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Redirect } from "~/components/Redirect";
import { useUser } from "~/hooks/useUser";
import {
  canSuggestNewUserFE,
  canSuggestNewUserBE,
  playerAlreadyMember,
  playerAlreadySuggested,
} from "~/permissions";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import type { PlusSuggestionsLoaderData } from "../suggestions";
import * as React from "react";
import { Label } from "~/components/Label";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH, PLUS_TIERS } from "~/constants";
import { UserCombobox } from "~/components/Combobox";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import { actualNumber } from "~/utils/zod";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  requireUser,
  validate,
} from "~/utils/remix";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";
import type { User } from "~/db/types";
import { ErrorMessage } from "~/components/ErrorMessage";

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

  const suggested = badRequestIfFalsy(
    db.users.findByIdentifier(data["user[value]"])
  );

  const user = await requireUser(request);

  const suggestions = db.plusSuggestions.findVisibleForUser({
    ...upcomingVoting(new Date()),
    plusTier: user.plusTier,
  });

  validate(suggestions);
  validate(
    canSuggestNewUserBE({
      user,
      suggested,
      targetPlusTier: data.tier,
      suggestions,
    })
  );

  db.plusSuggestions.create({
    authorId: user.id,
    suggestedId: suggested.id,
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
  const [selectedUser, setSelectedUser] = React.useState<{
    /** User id */
    value: string;
    plusTier: number | null;
  }>();

  const tierOptions = PLUS_TIERS.filter((tier) => {
    // user will be redirected anyway
    if (!user?.plusTier) return true;

    return tier >= user.plusTier;
  });
  const [targetPlusTier, setTargetPlusTier] = React.useState<number>(
    tierOptions[0]
  );

  if (
    !data.suggestions ||
    !canSuggestNewUserFE({
      user,
      suggestions: data.suggestions,
    })
  ) {
    return <Redirect to={PLUS_SUGGESTIONS_PAGE} />;
  }

  const selectedUserErrorMessage = getSelectedUserErrorMessage({
    suggested: selectedUser
      ? { id: Number(selectedUser.value), plusTier: selectedUser.plusTier }
      : undefined,
    suggestions: data.suggestions,
    targetPlusTier,
  });

  return (
    <Dialog className="plus__modal" isOpen>
      <Form method="post" className="stack md">
        <h2 className="plus__modal-title">Adding a new suggestion</h2>
        <div>
          <label htmlFor="tier">Tier</label>
          <select
            id="tier"
            name="tier"
            className="plus__modal-select"
            value={targetPlusTier}
            onChange={(e) => setTargetPlusTier(Number(e.target.value))}
          >
            {tierOptions.map((tier) => (
              <option key={tier} value={tier}>
                +{tier}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="user">Suggested user</label>
          <UserCombobox inputName="user" onChange={setSelectedUser} />
          {selectedUserErrorMessage ? (
            <ErrorMessage>{selectedUserErrorMessage}</ErrorMessage>
          ) : null}
        </div>
        <CommentTextarea />
        <div className="plus__modal-buttons">
          <Button
            type="submit"
            data-cy="submit-button"
            disabled={Boolean(selectedUserErrorMessage)}
          >
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

function getSelectedUserErrorMessage({
  suggestions,
  targetPlusTier,
  suggested,
}: {
  suggestions: NonNullable<PlusSuggestionsLoaderData["suggestions"]>;
  targetPlusTier: number;
  suggested?: Pick<User, "id" | "plusTier">;
}) {
  if (!suggested) return;

  if (
    playerAlreadyMember({
      suggested,
      targetPlusTier,
    })
  ) {
    return `This user already has access to +${targetPlusTier}`;
  }
  if (playerAlreadySuggested({ targetPlusTier, suggestions, suggested })) {
    return `This user was already suggested to +${targetPlusTier}`;
  }
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
