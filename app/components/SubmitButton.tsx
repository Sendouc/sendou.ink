import type { FetcherWithComponents } from "@remix-run/react";
import { Button, type ButtonProps } from "./Button";

interface SubmitButtonProps extends ButtonProps {
  state: FetcherWithComponents<any>["state"];
  _action: string;
}

export function SubmitButton({
  children,
  state,
  _action,
  ...rest
}: SubmitButtonProps) {
  const isSubmitting = state !== "idle";

  return (
    <Button
      {...rest}
      disabled={isSubmitting}
      type="submit"
      name="_action"
      value={_action}
    >
      {children}
    </Button>
  );
}
