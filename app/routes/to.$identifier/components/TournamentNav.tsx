import { NavLink } from "@remix-run/react";
import * as React from "react";

export function TournamentNav({
  children,
  tabsCount,
}: {
  children: React.ReactNode;
  tabsCount: number;
}) {
  return (
    <div className="tournament__links-overflower">
      <div className="tournament__links-border">
        <nav
          style={{ "--tabs-count": tabsCount } as any}
          className="tournament__links-container"
        >
          {children}
        </nav>
      </div>
    </div>
  );
}

export function TournamentNavLink({
  code,
  icon = null,
  text,
}: {
  code: string;
  icon?: React.ReactNode;
  text: string;
}) {
  const ref = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    if (!ref.current?.className.includes("active")) return;
    ref.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  return (
    <NavLink
      className="tournament__nav-link"
      to={code}
      data-cy={`${code}-nav-link`}
      prefetch="intent"
      end
      ref={ref}
    >
      {icon} {text}
    </NavLink>
  );
}
