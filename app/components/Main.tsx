import clsx from "clsx";
import type * as React from "react";
import { useMatches } from "react-router";
import { useUser } from "~/modules/auth";
import type { RootLoaderData } from "~/root";

export const Main = ({
  children,
  className,
  classNameOverwrite,
  halfWidth,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  classNameOverwrite?: string;
  halfWidth?: boolean;
  style?: React.CSSProperties;
}) => {
  const data = useMatches()[0]?.data as RootLoaderData | undefined;
  const user = useUser();
  const showLeaderboard = data?.gtagId && !user?.patronTier;

  return (
    <main
      className={
        classNameOverwrite
          ? clsx(classNameOverwrite, {
              "half-width": halfWidth,
              "pt-12-forced": showLeaderboard,
            })
          : clsx(
              "layout__main",
              "main",
              { "half-width": halfWidth, "pt-12-forced": showLeaderboard },
              className
            )
      }
      style={style}
    >
      {children}
    </main>
  );
};
