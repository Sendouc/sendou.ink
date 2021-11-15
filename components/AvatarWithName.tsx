import s from "../styles/AvatarWithName.module.css";

export function AvatarWithName(p: {
  discordName: string;
  discordAvatar: string | null;
  discordId: string;
}) {
  return (
    <div class={s.container}>
      <div class={s.placeholder}>
        <img
          alt=""
          class={s.avatar}
          loading="lazy"
          src={`https://cdn.discordapp.com/avatars/${p.discordId}/${p.discordAvatar}.png?size=80`}
        />
      </div>
      <div>{p.discordName}</div>
    </div>
  );
}
