import type * as React from "react";

export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return <div className="error-message">{children}</div>;
}
