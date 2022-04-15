import { Form } from "@remix-run/react";
import { useBaseURL, useTimeoutState } from "~/hooks/common";
import { FindManyByTrustReceiverId } from "~/models/TrustRelationship.server";
import { Button } from "./Button";
import { FormErrorMessage } from "./FormErrorMessage";
import { Label } from "./Label";
import { SubmitButton } from "./SubmitButton";

export function AddPlayers({
  pathname,
  inviteCode,
  addUserError,
  trustingUsers,
  hiddenInputs,
  tinyButtons = false,
  legendText,
}: {
  pathname: string;
  inviteCode: string;
  addUserError?: string;
  trustingUsers: FindManyByTrustReceiverId;
  hiddenInputs: { name: string; value: string }[];
  tinyButtons?: boolean;
  legendText: string;
}) {
  const baseURL = useBaseURL();
  const urlWithInviteCode = `${baseURL}${pathname}?code=${inviteCode}`;

  return (
    <fieldset className="add-players__actions">
      <legend>{legendText}</legend>
      <div className="add-players__actions__section">
        <Label htmlFor="inviteCodeInput">Share this URL</Label>
        <input
          id="inviteCodeInput"
          className="add-players__input"
          disabled
          value={urlWithInviteCode}
        />
        <CopyToClipboardButton
          urlWithInviteCode={urlWithInviteCode}
          tiny={tinyButtons}
        />
      </div>
      {trustingUsers.length > 0 && (
        <div className="add-players__actions__section">
          <Form method="post">
            {hiddenInputs.map((input) => (
              <input
                key={input.value}
                name={input.name}
                value={input.value}
                type="hidden"
              />
            ))}
            <Label htmlFor="userId">
              Add players you previously played with
            </Label>
            <select className="add-players__select" name="userId" id="userId">
              {trustingUsers.map(({ trustGiver }) => (
                <option key={trustGiver.id} value={trustGiver.id}>
                  {trustGiver.discordName}
                </option>
              ))}
            </select>
            <FormErrorMessage errorMsg={addUserError} />
            <SubmitButton
              className="add-players__input__button"
              actionType="ADD_PLAYER"
              loadingText="Adding..."
              data-cy="add-to-roster-button"
              tiny={tinyButtons}
            >
              Add
            </SubmitButton>
          </Form>
        </div>
      )}
    </fieldset>
  );
}

function CopyToClipboardButton({
  urlWithInviteCode,
  tiny,
}: {
  urlWithInviteCode: string;
  tiny: boolean;
}) {
  const [showCopied, setShowCopied] = useTimeoutState(false);

  return (
    <Button
      className="add-players__input__button"
      onClick={() => {
        navigator.clipboard
          .writeText(urlWithInviteCode)
          .then(() => setShowCopied(true))
          .catch((e) => console.error(e));
      }}
      type="button"
      data-cy="copy-to-clipboard-button"
      tiny={tiny}
      variant="outlined"
    >
      {showCopied ? "Copied!" : "Copy to clipboard"}
    </Button>
  );
}
