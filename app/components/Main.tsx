import clsx from "clsx";
import type * as React from "react";

export const Main = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <main className={clsx("layout__main", className)}>{children}</main>;
