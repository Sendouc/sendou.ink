import clsx from "clsx";
import type { User } from "~/db/types";

export function Avatar({
  discordId,
  discordAvatar,
  size,
  className,
  ...rest
}: Pick<User, "discordId" | "discordAvatar"> & {
  className?: string;
  size?: "lg";
} & React.ButtonHTMLAttributes<HTMLImageElement>) {
  // TODO: just show text... my profile?
  // TODO: also show this if discordAvatar is stale and 404's

  const dimensions = size === "lg" ? 125 : 44;

  return (
    <img
      className={clsx("avatar", className)}
      src={
        discordAvatar
          ? `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png${
              size === "lg" ? "" : "?size=80"
            }`
          : "/img/blank.gif" // avoid broken image placeholder
      }
      alt=""
      width={dimensions}
      height={dimensions}
      {...rest}
    />
  );
}
