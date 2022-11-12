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
  user,
  size = "sm",
  className,
  alt = "",
  ...rest
}: {
  user: Pick<User, "discordId" | "discordAvatar">;
  className?: string;
  alt?: string;
  size: keyof typeof dimensions;
} & React.ButtonHTMLAttributes<HTMLImageElement>) {
  const [isErrored, setIsErrored] = React.useState(false);
  // TODO: just show text... my profile?
  // TODO: also show this if discordAvatar is stale and 404's

  React.useEffect(() => {
    setIsErrored(false);
  }, [user.discordAvatar]);

  return (
    <img
      className={clsx("avatar", className)}
      src={
        user.discordAvatar && !isErrored
          ? `https://cdn.discordapp.com/avatars/${user.discordId}/${
              user.discordAvatar
            }.webp${size === "lg" ? "?size=240" : "?size=80"}`
          : "/img/blank.gif" // avoid broken image placeholder
      }
      alt={alt}
      title={alt ? alt : undefined}
      width={dimensions[size]}
      height={dimensions[size]}
      // https://github.com/jsx-eslint/eslint-plugin-react/issues/3388
      // eslint-disable-next-line react/no-unknown-property
      onError={() => setIsErrored(true)}
      {...rest}
    />
  );
}
