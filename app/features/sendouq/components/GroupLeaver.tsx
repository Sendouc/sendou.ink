import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/Button";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { SubmitButton } from "~/components/SubmitButton";
import { SENDOUQ_LOOKING_PAGE } from "~/utils/urls";

export function GroupLeaver({
  type,
}: {
  type: "LEAVE_GROUP" | "LEAVE_Q" | "GO_BACK";
}) {
  const fetcher = useFetcher();

  if (type === "LEAVE_GROUP") {
    return (
      <FormWithConfirm
        dialogHeading="Leave this group?"
        fields={[["_action", "LEAVE_GROUP"]]}
        deleteButtonText="Leave"
        action={SENDOUQ_LOOKING_PAGE}
      >
        <Button variant="minimal-destructive" size="tiny">
          Leave group
        </Button>
      </FormWithConfirm>
    );
  }

  // leave without confirm if alone
  return (
    <fetcher.Form method="POST" action={SENDOUQ_LOOKING_PAGE}>
      <SubmitButton
        _action="LEAVE_GROUP"
        variant="minimal-destructive"
        size="tiny"
        state={fetcher.state}
      >
        {type === "LEAVE_Q" ? "Leave queue" : "Go back"}
      </SubmitButton>
    </fetcher.Form>
  );
}
