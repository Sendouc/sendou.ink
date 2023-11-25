import { Link } from "@remix-run/react";
import type { LinkProps } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "success"
    | "outlined"
    | "outlined-success"
    | "destructive"
    | "minimal"
    | "minimal-success"
    | "minimal-destructive";
  size?: "miniscule" | "tiny" | "big";
  loading?: boolean;
  loadingText?: string;
  icon?: JSX.Element;
  testId?: string;
}

export function Button(props: ButtonProps) {
  const {
    variant,
    loading,
    children,
    loadingText,
    size,
    className,
    icon,
    type = "button",
    testId,
    ...rest
  } = props;
  return (
    <button
      className={clsx(
        variant,
        {
          "disabled-opaque": props.disabled,
          loading,
          tiny: size === "tiny",
          big: size === "big",
          miniscule: size === "miniscule",
        },
        className,
      )}
      disabled={props.disabled || loading}
      type={type}
      data-testid={testId}
      {...rest}
    >
      {icon &&
        React.cloneElement(icon, {
          className: clsx("button-icon", { lonely: !children }),
        })}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

type LinkButtonProps = Pick<
  ButtonProps,
  "variant" | "children" | "className" | "size" | "testId" | "icon"
> &
  Pick<LinkProps, "to" | "prefetch" | "state"> & { "data-cy"?: string } & {
    isExternal?: boolean;
  };

export function LinkButton({
  variant,
  children,
  size,
  className,
  to,
  prefetch,
  isExternal,
  state,
  testId,
  icon,
}: LinkButtonProps) {
  if (isExternal) {
    return (
      <a
        className={clsx(
          "button",
          variant,
          { tiny: size === "tiny", big: size === "big" },
          className,
        )}
        href={to as string}
        data-testid={testId}
        target="_blank"
        rel="noreferrer"
      >
        {icon &&
          React.cloneElement(icon, {
            className: clsx("button-icon", {
              lonely: !children,
            }),
          })}
        {children}
      </a>
    );
  }

  return (
    <Link
      className={clsx(
        "button",
        variant,
        { tiny: size === "tiny", big: size === "big" },
        className,
      )}
      to={to}
      data-testid={testId}
      prefetch={prefetch}
      state={state}
    >
      {icon &&
        React.cloneElement(icon, {
          className: clsx("button-icon", { lonely: !children }),
        })}
      {children}
    </Link>
  );
}
