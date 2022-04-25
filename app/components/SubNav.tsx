import { NavLink } from "@remix-run/react";
import React from "react";
import { ArrowUpIcon } from "./icons/ArrowUp";

export function SubNav({ children }: { children: React.ReactNode }) {
  return <nav className="sub-nav__container">{children}</nav>;
}

export function SubNavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink className="sub-nav__link" to={to} end>
      <span>{children}</span>
      <ArrowUpIcon className="sub-nav__active-icon" />
    </NavLink>
  );
}
