import type { User } from "~/db/types";

export function temporaryCanAccessArtCheck(user?: Pick<User, "isArtist">) {
  return user?.isArtist === 1;
}

export function previewUrl(url: string) {
  // images with https are not hosted on spaces, this is used for local development
  if (url.includes("https")) return url;

  const parts = url.split(".");
  return `${parts[0]}-small.${parts[1]}`;
}
