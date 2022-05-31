import { useMatches } from "@remix-run/react";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Redirect } from "~/components/Redirect";
import { useUser } from "~/hooks/useUser";
import { canAddNewSuggestionFE } from "~/permissions";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import type { PlusSuggestionsLoaderData } from "../suggestions";
import * as React from "react";
import { Label } from "~/components/Label";
import { PlUS_SUGGESTION_COMMENT_MAX_LENGTH, PLUS_TIERS } from "~/constants";
import invariant from "tiny-invariant";
import { Combobox } from "~/components/Combobox";

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
      <div className="stack md">
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
          <label htmlFor="user">User</label>
          <Combobox
            options={["Seppo", "Heppo"]}
            onChange={(val) => console.log(val)}
            inputName="user"
            placeholder="Sendou#0043"
          />
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
      </div>
    </Dialog>
  );
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
      />
    </div>
  );
}
