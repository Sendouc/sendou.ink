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
  if (!discordAvatar) return <div className="avatar" />;

  const dimensions = size === "lg" ? 125 : 44;

  return (
    <img
      className={clsx("avatar", className, { lg: size === "lg" })}
      src={`https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png${
        size === "lg" ? "" : "?size=80"
      }`}
      alt="My avatar"
      width={dimensions}
      height={dimensions}
      {...rest}
    />
  );
}
