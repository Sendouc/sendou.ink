import { DEV_MODE_ENABLED } from "~/constants";
import { invariant } from "~/utils/invariant";

export const getTwitchEnvVars = () => {
  const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;
  invariant(
    !DEV_MODE_ENABLED || TWITCH_CLIENT_ID,
    "Missing TWITCH_CLIENT_ID env var, showing no streams",
  );
  invariant(
    !DEV_MODE_ENABLED || TWITCH_CLIENT_SECRET,
    "Missing TWITCH_CLIENT_SECRET env var, showing no streams",
  );

  return { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET };
};

export const twitchThumbnailUrlToSrc = (url: string) =>
  url.replace("{width}", "640").replace("{height}", "360");
