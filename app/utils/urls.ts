import type { Badge, GearType } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
import type { AbilityWithUnknown } from "~/modules/in-game-lists/types";

export const PLUS_SERVER_DISCORD_URL = "https://discord.gg/FW4dKrY";
export const SENDOU_INK_DISCORD_URL = "https://discord.gg/sendou";
export const SENDOU_TWITTER_URL = "https://twitter.com/sendouc";
export const SENDOU_INK_TWITTER_URL = "https://twitter.com/sendouink";
export const SENDOU_INK_PATREON_URL = "https://patreon.com/sendou";
export const SENDOU_INK_GITHUB_URL = "https://github.com/Sendouc/sendou.ink";
export const GITHUB_CONTRIBUTORS_URL =
  "https://github.com/Sendouc/sendou.ink/graphs/contributors";
export const BORZOIC_TWITTER = "https://twitter.com/borzoic_";
export const LEAN_TWITTER = "https://twitter.com/LeanYoshi";
export const UBERU_TWITTER = "https://twitter.com/uberu5";
export const LOG_IN_URL = "/auth";
export const LOG_OUT_URL = "/auth/logout";
export const ADMIN_PAGE = "/admin";
export const FAQ_PAGE = "/faq";
export const CONTRIBUTIONS_PAGE = "/contributions";
export const BADGES_PAGE = "/badges";
export const CALENDAR_PAGE = "/calendar";
export const STOP_IMPERSONATING_URL = "/auth/impersonate/stop";
export const SEED_URL = "/seed";

export const userPage = (discordId: string) => `/u/${discordId}`;
export const userBuildsPage = (discordId: string) =>
  `${userPage(discordId)}/builds`;
export const impersonateUrl = (idToLogInAs: number) =>
  `/auth/impersonate?id=${idToLogInAs}`;
export const badgePage = (badgeId: number) => `${BADGES_PAGE}/${badgeId}`;
export const plusSuggestionPage = (tier?: string | number) =>
  `/plus/suggestions${tier ? `?tier=${tier}` : ""}`;
export const calendarEventPage = (eventId: number) => `/calendar/${eventId}`;
export const calendarEditPage = (eventId?: number) =>
  `/calendar/new${eventId ? `?eventId=${eventId}` : ""}`;
export const calendarReportWinnersPage = (eventId: number) =>
  `/calendar/${eventId}/report-winners`;
export const articlePage = (slug: string) => `/a/${slug}`;

export const badgeUrl = ({
  code,
  extension,
}: {
  code: Badge["code"];
  extension?: "gif";
}) => `/badges/${code}${extension ? `.${extension}` : ""}`;
export const articlePreviewUrl = (slug: string) =>
  `/img/article-previews/${slug}.png`;

export const navIconUrl = (navItem: string) => `/img/layout/${navItem}`;
export const gearImageUrl = (gearType: GearType, gearSplId: number) =>
  `/img/gear/${gearType.toLowerCase()}/${gearSplId}`;
export const weaponImageUrl = (weaponSplId: number) =>
  `/img/main-weapons/${weaponSplId}`;
export const abilityImageUrl = (ability: AbilityWithUnknown) =>
  `/img/abilities/${ability}`;
export const modeImageUrl = (mode: ModeShort) => `/img/modes/${mode}`;

export function resolveBaseUrl(url: string) {
  return new URL(url).host;
}
