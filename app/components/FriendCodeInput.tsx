import { useFetcher } from "@remix-run/react";
import { FormMessage } from "~/components/FormMessage";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { FRIEND_CODE_REGEXP_PATTERN } from "~/features/sendouq/q-constants";
import { SENDOUQ_PAGE } from "~/utils/urls";

// xxx: link to how to play + adjust form message text + i18n
export function FriendCodeInput({ friendCode }: { friendCode?: string }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action={SENDOUQ_PAGE}>
      <div className="stack sm horizontal items-end">
        <div>
          <Label htmlFor="friendCode">Friend code</Label>
          {friendCode ? (
            <div className="font-bold">SW-{friendCode}</div>
          ) : (
            <Input
              leftAddon="SW-"
              id="friendCode"
              name="friendCode"
              pattern={FRIEND_CODE_REGEXP_PATTERN}
              placeholder="1234-5678-9012"
            />
          )}
        </div>
        {!friendCode ? (
          <SubmitButton _action="ADD_FRIEND_CODE" state={fetcher.state}>
            Save
          </SubmitButton>
        ) : null}
      </div>
      <FormMessage type="info">Check how to play for more info</FormMessage>
    </fetcher.Form>
  );
}
