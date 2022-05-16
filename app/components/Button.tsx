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
  tiny?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: JSX.Element;
  "data-cy"?: string;
}

export function Button(props: ButtonProps) {
  const {
    variant,
    loading,
    children,
    loadingText,
    tiny,
    className,
    icon,
    type = "button",
    ...rest
  } = props;
  return (
    <button
      className={clsx(className, {
        success: variant === "success",
        outlined: variant === "outlined",
        "outlined-success": variant === "outlined-success",
        destructive: variant === "destructive",
        minimal: variant === "minimal",
        "minimal-success": variant === "minimal-success",
        "minimal-destructive": variant === "minimal-destructive",
        "disabled-opaque": props.disabled,
        loading,
        tiny,
      })}
      disabled={props.disabled || loading}
      type={type}
      {...rest}
    >
      {icon && React.cloneElement(icon, { className: "button-icon" })}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
