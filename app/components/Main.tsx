import clsx from "clsx";
import * as React from "react";
import { useUser } from "~/modules/auth";

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
  const user = useUser();
  const showLeaderboard = !user?.patronTier;

  return (
    <>
      {showLeaderboard ? <div id="top-leaderboard" /> : null}
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
    </>
  );
};
