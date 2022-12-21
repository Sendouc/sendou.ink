import { type FetcherWithComponents, useTransition } from "@remix-run/react";
import { Button, type ButtonProps } from "./Button";

interface SubmitButtonProps extends ButtonProps {
  state?: FetcherWithComponents<any>["state"];
  _action?: string;
}

export function SubmitButton({
  children,
  state,
  _action,
  ...rest
}: SubmitButtonProps) {
  const transition = useTransition();

  const isSubmitting = state ? state !== "idle" : transition.state !== "idle";

  return (
    <Button
      {...rest}
      disabled={isSubmitting}
      type="submit"
      name={_action ? "_action" : undefined}
      value={_action}
    >
      {children}
    </Button>
  );
}
