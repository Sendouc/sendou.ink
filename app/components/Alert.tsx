import type * as React from "react";
import { AlertIcon } from "./icons/Alert";

export function Alert({
  children,
  textClassName,
}: {
  children: React.ReactNode;
  textClassName?: string;
}) {
  return (
    <div className="alert">
      <AlertIcon /> <div className={textClassName}>{children}</div>
    </div>
  );
}
