import clsx from "clsx";
import * as React from "react";

export const Main = ({
  children,
  className,
  halfWidth,
}: {
  children: React.ReactNode;
  className?: string;
  halfWidth?: boolean;
}) => (
  <main
    className={clsx(
      "layout__main",
      "main",
      { "half-width": halfWidth },
      className
    )}
  >
    {children}
  </main>
);
