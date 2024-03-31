import clsx from "clsx";
import type { User } from "~/db/types";
import * as React from "react";
import { BLANK_IMAGE_URL } from "~/utils/urls";

const dimensions = {
  xxxs: 16,
  xxs: 24,
  xs: 36,
  sm: 44,
  xsm: 62,
  md: 81,
  lg: 125,
} as const;

function _Avatar({
  user,
  url,
  size = "sm",
  className,
  alt = "",
  ...rest
}: {
  user?: Pick<User, "discordId" | "discordAvatar">;
  url?: string;
  className?: string;
  alt?: string;
  size: keyof typeof dimensions;
} & React.ButtonHTMLAttributes<HTMLImageElement>) {
  const [isErrored, setIsErrored] = React.useState(false);
  // TODO: just show text... my profile?
  // TODO: also show this if discordAvatar is stale and 404's

  React.useEffect(() => {
    setIsErrored(false);
  }, [user?.discordAvatar]);

  const src =
    url ??
    (user?.discordAvatar && !isErrored
      ? `https://cdn.discordapp.com/avatars/${user.discordId}/${
          user.discordAvatar
        }.webp${size === "lg" ? "?size=240" : "?size=80"}`
      : BLANK_IMAGE_URL); // avoid broken image placeholder

  return (
    <img
      className={clsx("avatar", className)}
      src={src}
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

export const Avatar = React.memo(_Avatar);
