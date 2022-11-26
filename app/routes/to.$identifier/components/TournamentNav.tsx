import { NavLink } from "@remix-run/react";
import type { RemixNavLinkProps } from "@remix-run/react/dist/components";
import clsx from "clsx";
import type * as React from "react";
import { ArrowUpIcon } from "~/components/icons/ArrowUp";

export function TournamentNav({ children }: { children: React.ReactNode }) {
  return <nav className="sub-nav__container">{children}</nav>;
}

export function TournamentNavLink({
  children,
  className,
  ...props
}: RemixNavLinkProps & {
  children: React.ReactNode;
}) {
  return (
    <NavLink className={clsx("tournament-nav__link", className)} end {...props}>
      <span className="tournament-nav__link__text">{children}</span>
      <ArrowUpIcon className="tournament-nav__active-icon" />
    </NavLink>
  );
}
