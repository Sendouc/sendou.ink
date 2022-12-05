import slugify from "slugify";
import type {
  Badge,
  CalendarEvent,
  GearType,
  MapPoolMap,
  User,
} from "~/db/types";
import type { ModeShort, weaponCategories } from "~/modules/in-game-lists";
import type {
  Ability,
  AbilityWithUnknown,
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
  StageId,
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
export const TLDRAW_URL = "https://www.tldraw.com/";
export const BORZOIC_TWITTER = "https://twitter.com/borzoic_";
export const LEAN_TWITTER = "https://twitter.com/LeanYoshi";
export const UBERU_TWITTER = "https://twitter.com/uberu5";
export const TWIG_TWITTER = "https://twitter.com/TwigTheBluePik";
export const CHARA_TWITTER = "https://twitter.com/ProChara";
export const ipLabsMaps = (pool: string) =>
  `https://maps.iplabs.ink/?3&pool=${pool}`;

export const LOG_IN_URL = "/auth";
export const LOG_OUT_URL = "/auth/logout";
export const ADMIN_PAGE = "/admin";
export const ARTICLES_MAIN_PAGE = "/a";
export const FAQ_PAGE = "/faq";
export const CONTRIBUTIONS_PAGE = "/contributions";
export const BADGES_PAGE = "/badges";
export const BUILDS_PAGE = "/builds";
export const USER_SEARCH_PAGE = "/u";
export const CALENDAR_PAGE = "/calendar";
export const STOP_IMPERSONATING_URL = "/auth/impersonate/stop";
export const SEED_URL = "/seed";
export const PLANNER_URL = "/plans";
export const MAPS_URL = "/maps";
export const ANALYZER_URL = "/analyzer";
export const OBJECT_DAMAGE_CALCULATOR_URL = "/object-damage-calculator";

export const BLANK_IMAGE_URL = "/static-assets/img/blank.gif";
export const COMMON_PREVIEW_IMAGE =
  "/static-assets/img/layout/common-preview.png";
export const ERROR_GIRL_IMAGE_PATH = "/static-assets/img/layout/error-girl";
export const LOGO_PATH = "/static-assets/img/layout/logo";
export const SENDOU_LOVE_EMOJI_PATH = "/static-assets/img/layout/sendou_love";
export const FIRST_PLACEMENT_ICON_PATH =
  "/static-assets/svg/placements/first.svg";
export const SECOND_PLACEMENT_ICON_PATH =
  "/static-assets/svg/placements/second.svg";
export const THIRD_PLACEMENT_ICON_PATH =
  "/static-assets/svg/placements/third.svg";
export const FRONT_BOY_PATH = "/static-assets/img/layout/front-boy";
export const FRONT_GIRL_PATH = "/static-assets/img/layout/front-girl";
export const FRONT_BOY_BG_PATH = "/static-assets/img/layout/front-boy-bg";
export const FRONT_GIRL_BG_PATH = "/static-assets/img/layout/front-girl-bg";

export const GET_ALL_USERS_ROUTE = "/users";
export const GET_ALL_EVENTS_WITH_MAP_POOLS_ROUTE = "/calendar/map-pool-events";

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

export const weaponBuildPage = (weaponSlug: string) =>
  `${BUILDS_PAGE}/${weaponSlug}`;

export const calendarEventPage = (eventId: number) => `/calendar/${eventId}`;
export const calendarEditPage = (eventId?: number) =>
  `/calendar/new${eventId ? `?eventId=${eventId}` : ""}`;
export const calendarReportWinnersPage = (eventId: number) =>
  `/calendar/${eventId}/report-winners`;
export const toToolsPage = (eventId: number) => `/to/${eventId}`;

export const mapsPage = (eventId?: MapPoolMap["calendarEventId"]) =>
  `/maps${eventId ? `?eventId=${eventId}` : ""}`;
export const readonlyMapsPage = (eventId: CalendarEvent["id"]) =>
  `/maps?readonly&eventId=${eventId}`;
export const articlePage = (slug: string) => `${ARTICLES_MAIN_PAGE}/${slug}`;
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
export const objectDamageCalculatorPage = (weaponId?: MainWeaponId) =>
  `/object-damage-calculator${
    typeof weaponId === "number" ? `?weapon=${weaponId}` : ""
  }`;

export const badgeUrl = ({
  code,
  extension,
}: {
  code: Badge["code"];
  extension?: "gif";
}) => `/static-assets/badges/${code}${extension ? `.${extension}` : ""}`;
export const articlePreviewUrl = (slug: string) =>
  `/static-assets/img/article-previews/${slug}.png`;

export const navIconUrl = (navItem: typeof navItems[number]["name"]) =>
  `/static-assets/img/layout/${navItem}`;
export const gearImageUrl = (gearType: GearType, gearSplId: number) =>
  `/static-assets/img/gear/${gearType.toLowerCase()}/${gearSplId}`;
export const weaponCategoryUrl = (
  category: typeof weaponCategories[number]["name"]
) => `/static-assets/img/weapon-categories/${category}`;
export const mainWeaponImageUrl = (mainWeaponSplId: MainWeaponId) =>
  `/static-assets/img/main-weapons/${mainWeaponSplId}`;
export const outlinedMainWeaponImageUrl = (mainWeaponSplId: MainWeaponId) =>
  `/static-assets/img/main-weapons-outlined/${mainWeaponSplId}`;
export const subWeaponImageUrl = (subWeaponSplId: SubWeaponId) =>
  `/static-assets/img/sub-weapons/${subWeaponSplId}`;
export const specialWeaponImageUrl = (specialWeaponSplId: SpecialWeaponId) =>
  `/static-assets/img/special-weapons/${specialWeaponSplId}`;
export const abilityImageUrl = (ability: AbilityWithUnknown) =>
  `/static-assets/img/abilities/${ability}`;
export const modeImageUrl = (mode: ModeShort) =>
  `/static-assets/img/modes/${mode}`;
export const stageImageUrl = (stageId: StageId) =>
  `/static-assets/img/stages/${stageId}`;
export const stageMinimapImageUrlWithEnding = ({
  stageId,
  modeShort,
}: {
  stageId: StageId;
  modeShort: ModeShort;
}) => `/static-assets/img/stage-minimaps/${stageId}-${modeShort}.jpeg`;

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
