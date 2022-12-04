import { NavLink } from "@remix-run/react";
import type { LinkProps } from "@remix-run/react";
import clsx from "clsx";
import type * as React from "react";

export function SubNav({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="sub-nav__container">{children}</nav>
    </div>
  );
}

export function SubNavLink({
  children,
  className,
  ...props
}: LinkProps & {
  children: React.ReactNode;
}) {
  return (
    <NavLink className={clsx("sub-nav__link", className)} end {...props}>
      {children}
    </NavLink>
  );
}
