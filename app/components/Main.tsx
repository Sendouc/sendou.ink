import clsx from "clsx";
import type * as React from "react";

export const Main = ({
  children,
  className,
  halfWidth,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  halfWidth?: boolean;
  style?: React.CSSProperties;
}) => (
  <main
    className={clsx(
      "layout__main",
      "main",
      { "half-width": halfWidth },
      className
    )}
    style={style}
  >
    {children}
  </main>
);
