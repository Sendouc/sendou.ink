import classNames from "classnames";
import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined";
  loading?: boolean;
  loadingText?: string;
  "data-cy"?: string;
}

export function Button(props: ButtonProps) {
  const { variant, loading, children, loadingText, ...rest } = props;
  return (
    <button
      className={classNames({
        outlined: variant === "outlined",
        loading: loading,
      })}
      disabled={loading}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
