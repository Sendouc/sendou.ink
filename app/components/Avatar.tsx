import clsx from "clsx";
import type { User } from "~/db/types";
import * as React from "react";

const dimensions = {
  xxs: 24,
  xs: 36,
  sm: 44,
  md: 81,
  lg: 125,
} as const;

export function Avatar({
  discordId,
  discordAvatar,
  size = "sm",
  className,
  ...rest
}: Pick<User, "discordId" | "discordAvatar"> & {
  className?: string;
  size: keyof typeof dimensions;
} & React.ButtonHTMLAttributes<HTMLImageElement>) {
  const [isErrored, setIsErrored] = React.useState(false);
  // TODO: just show text... my profile?
  // TODO: also show this if discordAvatar is stale and 404's

  return (
    <img
      className={clsx("avatar", className)}
      src={
        discordAvatar && !isErrored
          ? `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.webp${
              size === "lg" ? "" : "?size=80"
            }`
          : "/img/blank.gif" // avoid broken image placeholder
      }
      alt=""
      width={dimensions[size]}
      height={dimensions[size]}
      onError={() => setIsErrored(true)}
      {...rest}
    />
  );
}
