import { useEffect } from "react";
import { useActionData, useTransition } from "remix";
import { useTimeoutState } from "~/utils/hooks";
import { Button, ButtonProps } from "./Button";

export function SubmitButton(
  _props: ButtonProps & { actionType: string; successText: string }
) {
  const { actionType, successText, children, ...rest } = _props;
  const actionData = useActionData<{ ok?: string }>();
  const transition = useTransition();
  const [showSuccess, setShowSuccess] = useTimeoutState(false);

  useEffect(() => {
    if (actionData?.ok !== actionType) return;

    setShowSuccess(true);
  }, [actionData]);

  const isLoading = (): boolean => {
    if (transition.type !== "actionSubmission") return false;

    const _action = transition.submission?.formData.get("_action");
    if (_action !== actionType) return false;

    return true;
  };

  return (
    <Button
      type="submit"
      loading={isLoading()}
      variant={showSuccess ? "success" : rest.variant}
      {...rest}
    >
      {showSuccess ? successText : children}
    </Button>
  );
}
