import type * as React from "react";

export const Main = ({ children }: { children: React.ReactNode }) => (
  <main className="layout__main">{children}</main>
);
