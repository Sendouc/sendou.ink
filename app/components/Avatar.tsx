import clsx from "clsx";
import { MyCSSProperties } from "~/utils";

export function Avatar({
  user,
  size,
}: {
  user: { discordId: string; discordAvatar: string | null };
  size?: "tiny" | "mini";
}) {
  const style: MyCSSProperties = {
    "--_avatar-size":
      size === "tiny" ? "2rem" : size === "mini" ? "1.5rem" : undefined,
  };
  return (
    <div style={style} className={clsx("avatar__placeholder", { tiny: size })}>
      {user.discordAvatar && (
        <img
          alt=""
          className={clsx("avatar__img", { tiny: size })}
          loading="lazy"
          src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=80`}
        />
      )}
    </div>
  );
}
