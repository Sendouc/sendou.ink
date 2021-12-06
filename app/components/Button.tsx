import classNames from "classnames";
import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "destructive";
  tiny?: boolean;
  loading?: boolean;
  loadingText?: string;
  "data-cy"?: string;
}

export function Button(props: ButtonProps) {
  const { variant, loading, children, loadingText, tiny, className, ...rest } =
    props;
  return (
    <button
      className={classNames(className, {
        outlined: variant === "outlined",
        destructive: variant === "destructive",
        loading: loading,
        tiny,
      })}
      disabled={loading}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
