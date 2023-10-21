import { useCatch, useLocation } from "@remix-run/react";
import clsx from "clsx";
import type * as React from "react";
import { useMatches } from "react-router";
import { useUser } from "~/modules/auth";
import type { RootLoaderData } from "~/root";
import { SideNav } from "app/components/layout/SideNav";

export const Main = ({
  children,
  className,
  classNameOverwrite,
  halfWidth,
  bigger,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  classNameOverwrite?: string;
  halfWidth?: boolean;
  bigger?: boolean;
  style?: React.CSSProperties;
}) => {
  const caught = useCatch();
  const data = useMatches()[0]?.data as RootLoaderData | undefined;
  const user = useUser();
  const showLeaderboard = data?.publisherId && !user?.patronTier && !caught;

  const location = useLocation();
  const isFrontPage = location.pathname === "/";

  return (
    <div className="layout__main-container">
      {!isFrontPage ? <SideNav /> : null}
      <main
        className={
          classNameOverwrite
            ? clsx(classNameOverwrite, {
                "half-width": halfWidth,
                "pt-8-forced": showLeaderboard,
              })
            : clsx(
                "layout__main",
                "main",
                {
                  "half-width": halfWidth,
                  bigger,
                  "pt-8-forced": showLeaderboard,
                },
                className,
              )
        }
        style={style}
      >
        {children}
      </main>
    </div>
  );
};
