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
    <NavLink className={"sub-nav__link__container"} end {...props}>
      <div className={clsx("sub-nav__link", className)}>{children}</div>
      <div className="sub-nav__border-guy" />
    </NavLink>
  );
}
