import { NavLink } from "@remix-run/react";
import type { LinkProps } from "@remix-run/react";
import clsx from "clsx";
import type * as React from "react";
import { ArrowUpIcon } from "./icons/ArrowUp";

export function SubNav({ children }: { children: React.ReactNode }) {
  return <nav className="sub-nav__container">{children}</nav>;
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
      <span className="sub-nav__link__text">{children}</span>
      <ArrowUpIcon className="sub-nav__active-icon" />
    </NavLink>
  );
}
