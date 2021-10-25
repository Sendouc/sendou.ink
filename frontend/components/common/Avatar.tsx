import { Avatar as MantineAvatar } from "@mantine/core";

export function Avatar({ src }: { src: string }) {
  return <MantineAvatar radius="lg" src={src} />;
}
