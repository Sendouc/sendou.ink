import { useEffect } from "react";
import { useActionData, useTransition } from "remix";
import { useTimeoutState } from "~/utils/hooks";
import { Button, ButtonProps } from "./Button";

export function SubmitButton(
  _props: ButtonProps & {
    actionType: string;
    successText?: string;
    onSuccess?: () => void;
  }
) {
  const { actionType, successText, onSuccess, children, ...rest } = _props;
  const actionData = useActionData<{ ok?: string }>();
  const transition = useTransition();
  const [showSuccess, setShowSuccess] = useTimeoutState(false);

  useEffect(() => {
    // did this submit button's action happen?
    if (actionData?.ok !== actionType) return;
    // this is essentially to ensure this only fires once per mutation
    if (transition.type !== "actionReload") return;

    onSuccess?.();
    setShowSuccess(true);
  }, [actionData?.ok, transition.type]);

  const isLoading = (): boolean => {
    // is there an action happening at the moment?
    if (!["actionSubmission", "actionReload"].includes(transition.type)) {
      return false;
    }

    // is it the action of this submit button?
    const _action = transition.submission?.formData.get("_action");
    if (_action !== actionType) return false;

    return true;
  };

  return (
    <Button
      type="submit"
      loading={isLoading()}
      variant={showSuccess && successText ? "success" : rest.variant}
      {...rest}
    >
      {showSuccess && successText ? successText : children}
    </Button>
  );
}
