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
    if ((!successText && !onSuccess) || actionData?.ok !== actionType) return;

    onSuccess?.();
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
      variant={showSuccess && successText ? "success" : rest.variant}
      {...rest}
    >
      {showSuccess && successText ? successText : children}
    </Button>
  );
}
