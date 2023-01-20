import clsx from "clsx";
import type * as React from "react";

// shares styles with SubNav.tsx

export function Tabs({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("sub-nav__container", className)}>{children}</div>
  );
}

export function Tab({
  children,
  className,
  active,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  active: boolean;
  onClick: () => void;
}) {
  // TODO: improve semantic html here, maybe could use tab component from Headless UI?
  return (
    <div
      className={clsx("sub-nav__link__container", { active })}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-pressed="false"
    >
      <div className={clsx("sub-nav__link", className)}>{children}</div>
      <div className="sub-nav__border-guy" />
    </div>
  );
}
