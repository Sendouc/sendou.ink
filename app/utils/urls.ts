import slugify from "slugify";
import type { Badge, GearType, MapPoolMap, User } from "~/db/types";
import type { ModeShort, weaponCategories } from "~/modules/in-game-lists";
import type {
  Ability,
  AbilityWithUnknown,
  MainWeaponId,
  SpecialWeaponId,
  StageId,
  SubWeaponId,
} from "~/modules/in-game-lists/types";
import type navItems from "~/components/layout/nav-items.json";
import { type AuthErrorCode } from "~/modules/auth";

export const SPLATOON_2_SENDOU_IN_URL = "https://spl2.sendou.ink";
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
export const ipLabsMaps = (pool: string) =>
  `https://maps.iplabs.ink/?3&pool=${pool}`;

export const LOG_IN_URL = "/auth";
export const LOG_OUT_URL = "/auth/logout";
export const ADMIN_PAGE = "/admin";
export const FAQ_PAGE = "/faq";
export const CONTRIBUTIONS_PAGE = "/contributions";
export const BADGES_PAGE = "/badges";
export const BUILDS_PAGE = "/builds";
export const CALENDAR_PAGE = "/calendar";
export const STOP_IMPERSONATING_URL = "/auth/impersonate/stop";
export const SEED_URL = "/seed";

export const COMMON_PREVIEW_IMAGE = "/img/layout/common-preview.png";
export const ERROR_GIRL_IMAGE_PATH = `/img/layout/error-girl`;
export const LOGO_PATH = `/img/layout/logo`;

interface UserLinkArgs {
  discordId: User["discordId"];
  customUrl?: User["customUrl"];
}

export const userPage = (user: UserLinkArgs) =>
  `/u/${user.customUrl ?? user.discordId}`;
export const userEditProfilePage = (user: UserLinkArgs) =>
  `${userPage(user)}/edit`;
export const userBuildsPage = (user: UserLinkArgs) =>
  `${userPage(user)}/builds`;
export const userResultsPage = (user: UserLinkArgs) =>
  `${userPage(user)}/results`;
export const userResultsEditHighlightsPage = (user: UserLinkArgs) =>
  `${userResultsPage(user)}/highlights`;
export const userNewBuildPage = (user: UserLinkArgs) =>
  `${userBuildsPage(user)}/new`;

export const authErrorUrl = (errorCode: AuthErrorCode) =>
  `/?authError=${errorCode}`;
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
export const calendarEventMapPool = (eventId: number) =>
  `/calendar/${eventId}/map-pool`;
export const mapsPage = (eventId?: MapPoolMap["calendarEventId"]) =>
  `/maps${eventId ? `?eventId=${eventId}` : ""}`;
export const articlePage = (slug: string) => `/a/${slug}`;
export const analyzerPage = (args?: {
  weaponId: MainWeaponId;
  abilities: Ability[];
}) =>
  `/analyzer${
    args
      ? `?weapon=${args.weaponId}&build=${encodeURIComponent(
          args.abilities.join(",")
        )}`
      : ""
  }`;

export const badgeUrl = ({
  code,
  extension,
}: {
  code: Badge["code"];
  extension?: "gif";
}) => `/badges/${code}${extension ? `.${extension}` : ""}`;
export const articlePreviewUrl = (slug: string) =>
  `/img/article-previews/${slug}.png`;

export const navIconUrl = (navItem: typeof navItems[number]["name"]) =>
  `/img/layout/${navItem}`;
export const gearImageUrl = (gearType: GearType, gearSplId: number) =>
  `/img/gear/${gearType.toLowerCase()}/${gearSplId}`;
export const weaponCategoryUrl = (
  category: typeof weaponCategories[number]["name"]
) => `/img/weapon-categories/${category}`;
export const mainWeaponImageUrl = (mainWeaponSplId: MainWeaponId) =>
  `/img/main-weapons/${mainWeaponSplId}`;
export const subWeaponImageUrl = (subWeaponSplId: SubWeaponId) =>
  `/img/sub-weapons/${subWeaponSplId}`;
export const specialWeaponImageUrl = (specialWeaponSplId: SpecialWeaponId) =>
  `/img/special-weapons/${specialWeaponSplId}`;
export const abilityImageUrl = (ability: AbilityWithUnknown) =>
  `/img/abilities/${ability}`;
export const modeImageUrl = (mode: ModeShort) => `/img/modes/${mode}`;
export const stageImageUrl = (stageId: StageId) => `/img/stages/${stageId}`;

export function resolveBaseUrl(url: string) {
  return new URL(url).host;
}

export const mySlugify = (name: string) => {
  return slugify(name, {
    lower: true,
    strict: true,
  });
};

export const isCustomUrl = (value: string) => {
  return Number.isNaN(Number(value));
};
