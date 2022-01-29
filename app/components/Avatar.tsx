import clsx from "clsx";
import { MyCSSProperties } from "~/utils";

export function Avatar({
  user,
  tiny = false,
}: {
  user: { discordId: string; discordAvatar: string | null };
  tiny?: boolean;
}) {
  const style: MyCSSProperties = {
    "--_avatar-size": tiny ? "2rem" : undefined,
  };
  return (
    <div style={style} className={clsx("avatar__placeholder", { tiny })}>
      {user.discordAvatar && (
        <img
          alt=""
          className={clsx("avatar__img", { tiny })}
          loading="lazy"
          src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=80`}
        />
      )}
    </div>
  );
}
