import type { Badge } from "~/db/types";

export const SENDOU_INK_DISCORD_URL = "https://discord.gg/sendou";
export const SENDOU_INK_TWITTER_URL = "https://twitter.com/sendouink";
export const SENDOU_INK_PATREON_URL = "https://patreon.com/sendou";
export const SENDOU_INK_GITHUB_URL = "https://github.com/Sendouc/sendou.ink";
export const LOG_IN_URL = "/auth";
export const LOG_OUT_URL = "/auth/logout";
export const PLUS_SUGGESTIONS_PAGE = "/plus/suggestions";
export const ADMIN_PAGE = "/admin";
export const FAQ_PAGE = "/faq";
export const BADGES_PAGE = "/badges";
export const STOP_IMPERSONATING_URL = "/auth/impersonate/stop";

export const userPage = (discordId: string) => `/u/${discordId}`;
export const impersonateUrl = (idToLogInAs: number) =>
  `/auth/impersonate?id=${idToLogInAs}`;
export const badgePage = (badgeId: number) => `${BADGES_PAGE}/${badgeId}`;

export const badgeUrl = ({
  code,
  extension,
}: {
  code: Badge["code"];
  extension?: "gif";
}) => `/badges/${code}${extension ? `.${extension}` : ""}`;
