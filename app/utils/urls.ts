import slugify from "slugify";
import type {
  Badge,
  CalendarEvent,
  GearType,
  MapPoolMap,
  XRankPlacement,
  User,
  Art,
  GroupMatch,
} from "~/db/types";
import type { ModeShort, weaponCategories } from "~/modules/in-game-lists";
import type {
  Ability,
  AbilityWithUnknown,
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
  StageId,
  BuildAbilitiesTupleWithUnknown,
} from "~/modules/in-game-lists/types";
import type navItems from "~/components/layout/nav-items.json";
import { type AuthErrorCode } from "~/features/auth/core";
import type { StageBackgroundStyle } from "~/features/map-planner";
import type { ImageUploadType } from "~/features/img-upload";
import { serializeBuild } from "~/features/build-analyzer";
import type { ArtSouce } from "~/features/art";
import { JOIN_CODE_SEARCH_PARAM_KEY } from "~/features/sendouq/q-constants";
import type { TierName } from "~/features/mmr/mmr-constants";
import type { Preference } from "~/db/tables";

// xxx: eventId -> tournamentId

const staticAssetsUrl = ({
  folder,
  fileName,
}: {
  folder: string;
  fileName: string;
}) =>
  `https://raw.githubusercontent.com/Sendouc/sendou-ink-assets/main/${folder}/${fileName}`;

export const SENDOU_INK_BASE_URL = "https://sendou.ink";

const USER_SUBMITTED_IMAGE_ROOT = "https://sendou.nyc3.digitaloceanspaces.com";
export const userSubmittedImage = (fileName: string) =>
  `${USER_SUBMITTED_IMAGE_ROOT}/${fileName}`;
// images with https are not hosted on spaces, this is used for local development
export const conditionalUserSubmittedImage = (fileName: string) =>
  fileName.includes("https") ? fileName : userSubmittedImage(fileName);

export const PLUS_SERVER_DISCORD_URL = "https://discord.gg/FW4dKrY";
export const SENDOU_INK_DISCORD_URL = "https://discord.gg/sendou";
export const SENDOU_TWITTER_URL = "https://twitter.com/sendouc";
export const SENDOU_INK_PATREON_URL = "https://patreon.com/sendou";
export const NINTENDO_COMMUNITY_TOURNAMENTS_GUIDELINES_URL =
  "https://en-americas-support.nintendo.com/app/answers/detail/a_id/63454";
export const PATREON_HOW_TO_CONNECT_DISCORD_URL =
  "https://support.patreon.com/hc/en-us/articles/212052266-How-do-I-connect-Discord-to-Patreon-Patron-";
export const SENDOU_INK_GITHUB_URL = "https://github.com/Sendouc/sendou.ink";
export const GITHUB_CONTRIBUTORS_URL =
  "https://github.com/Sendouc/sendou.ink/graphs/contributors";
export const TLDRAW_URL = "https://www.tldraw.com/";
export const BORZOIC_TWITTER = "https://twitter.com/borzoic_";
export const LEAN_TWITTER = "https://twitter.com/LeanYoshi";
export const UBERU_TWITTER = "https://twitter.com/uberu5";
export const YAGA_TWITTER = "https://twitter.com/a_bog_hag";
export const ANTARISKA_TWITTER = "https://twitter.com/antariska_spl";
export const ipLabsMaps = (pool: string) =>
  `https://maps.iplabs.ink/?3&pool=${pool}`;
export const SPLATOON_3_INK = "https://splatoon3.ink/";
export const RHODESMAS_FREESOUND_PROFILE_URL =
  "https://freesound.org/people/rhodesmas/";
export const SPLATTERCOLOR_SCREEN_TWITTER_URL =
  "https://twitter.com/ProChara/status/1730986554078945562";

export const twitterUrl = (accountName: string) =>
  `https://twitter.com/${accountName}`;
export const twitchUrl = (accountName: string) =>
  `https://twitch.tv/${accountName}`;

export const LOG_IN_URL = "/auth";
export const LOG_OUT_URL = "/auth/logout";
export const ADMIN_PAGE = "/admin";
export const ARTICLES_MAIN_PAGE = "/a";
export const FAQ_PAGE = "/faq";
export const PRIVACY_POLICY_PAGE = "/privacy-policy";
export const SUPPORT_PAGE = "/support";
export const CONTRIBUTIONS_PAGE = "/contributions";
export const BADGES_PAGE = "/badges";
export const BUILDS_PAGE = "/builds";
export const USER_SEARCH_PAGE = "/u";
export const TEAM_SEARCH_PAGE = "/t";
export const CALENDAR_PAGE = "/calendar";
export const STOP_IMPERSONATING_URL = "/auth/impersonate/stop";
export const SEED_URL = "/seed";
export const PLANNER_URL = "/plans";
export const MAPS_URL = "/maps";
export const ANALYZER_URL = "/analyzer";
export const OBJECT_DAMAGE_CALCULATOR_URL = "/object-damage-calculator";
export const VODS_PAGE = "/vods";
export const LEADERBOARDS_PAGE = "/leaderboards";
export const LINKS_PAGE = "/links";
export const SENDOUQ_YOUTUBE_VIDEO =
  "https://youtu.be/juOIDmkS1dw?si=iMU4LC_bDmp3fiB1";
export const SENDOUQ_PAGE = "/q";
export const SENDOUQ_RULES_PAGE = "/q/rules";
export const SENDOUQ_SETTINGS_PAGE = "/q/settings";
export const SENDOUQ_PREPARING_PAGE = "/q/preparing";
export const SENDOUQ_LOOKING_PAGE = "/q/looking";
export const SENDOUQ_STREAMS_PAGE = "/q/streams";
export const TIERS_PAGE = "/tiers";

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

export const soundPath = (fileName: string) =>
  `/static-assets/sounds/${fileName}.wav`;

export const GET_ALL_EVENTS_WITH_MAP_POOLS_ROUTE = "/calendar/map-pool-events";

interface UserLinkArgs {
  discordId: User["discordId"];
  customUrl?: User["customUrl"];
}

export const userPage = (user: UserLinkArgs) =>
  `/u/${user.customUrl ?? user.discordId}`;
export const userSeasonsPage = ({
  user,
  season,
}: {
  user: UserLinkArgs;
  season?: number;
}) =>
  `${userPage(user)}/seasons${
    typeof season === "number" ? `?season=${season}` : ""
  }`;
export const userEditProfilePage = (user: UserLinkArgs) =>
  `${userPage(user)}/edit`;
export const userBuildsPage = (user: UserLinkArgs) =>
  `${userPage(user)}/builds`;
export const userResultsPage = (user: UserLinkArgs) =>
  `${userPage(user)}/results`;
export const userVodsPage = (user: UserLinkArgs) => `${userPage(user)}/vods`;
export const newVodPage = (vodToEditId?: number) =>
  `${VODS_PAGE}/new${vodToEditId ? `?vod=${vodToEditId}` : ""}`;
export const userResultsEditHighlightsPage = (user: UserLinkArgs) =>
  `${userResultsPage(user)}/highlights`;
export const artPage = (tag?: string) => `/art${tag ? `?tag=${tag}` : ""}`;
export const userArtPage = (user: UserLinkArgs, source?: ArtSouce) =>
  `${userPage(user)}/art${source ? `?source=${source}` : ""}`;
export const newArtPage = (artId?: Art["id"]) =>
  `${artPage()}/new${artId ? `?art=${artId}` : ""}`;
export const userNewBuildPage = (
  user: UserLinkArgs,
  params?: { weapon: MainWeaponId; build: BuildAbilitiesTupleWithUnknown },
) =>
  `${userBuildsPage(user)}/new${
    params
      ? `?${String(
          new URLSearchParams({
            weapon: String(params.weapon),
            build: serializeBuild(params.build),
          }),
        )}`
      : ""
  }`;

export const teamPage = (customUrl: string) => `/t/${customUrl}`;
export const editTeamPage = (customUrl: string) =>
  `${teamPage(customUrl)}/edit`;
export const manageTeamRosterPage = (customUrl: string) =>
  `${teamPage(customUrl)}/roster`;
export const joinTeamPage = ({
  customUrl,
  inviteCode,
}: {
  customUrl: string;
  inviteCode: string;
}) => `${teamPage(customUrl)}/join?code=${inviteCode}`;

export const topSearchPage = (args?: {
  month: number;
  year: number;
  mode: ModeShort;
  region: XRankPlacement["region"];
}) =>
  args
    ? `/xsearch?month=${args.month}&year=${args.year}&mode=${args.mode}&region=${args.region}`
    : "/xsearch";
export const topSearchPlayerPage = (playerId: number) =>
  `${topSearchPage()}/player/${playerId}`;

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
export const tournamentPage = (eventId: number) => `/to/${eventId}`;
export const tournamentTeamPage = ({
  eventId,
  tournamentTeamId,
}: {
  eventId: number;
  tournamentTeamId: number;
}) => `/to/${eventId}/teams/${tournamentTeamId}`;
export const tournamentRegisterPage = (eventId: number) =>
  `/to/${eventId}/register`;
export const tournamentMapsPage = (eventId: number) => `/to/${eventId}/maps`;
export const tournamentAdminPage = (eventId: number) => `/to/${eventId}/admin`;
export const tournamentBracketsPage = ({
  tournamentId,
  bracketIdx,
}: {
  tournamentId: number;
  bracketIdx?: number | null;
}) =>
  `/to/${tournamentId}/brackets${
    typeof bracketIdx === "number" ? `?idx=${bracketIdx}` : ""
  }`;
export const tournamentBracketsSubscribePage = (eventId: number) =>
  `/to/${eventId}/brackets/subscribe`;
export const tournamentMatchPage = ({
  eventId,
  matchId,
}: {
  eventId: number;
  matchId: number;
}) => `/to/${eventId}/matches/${matchId}`;
export const tournamentMatchSubscribePage = ({
  eventId,
  matchId,
}: {
  eventId: number;
  matchId: number;
}) => `/to/${eventId}/matches/${matchId}/subscribe`;
export const tournamentJoinPage = ({
  eventId,
  inviteCode,
}: {
  eventId: number;
  inviteCode: string;
}) => `/to/${eventId}/join?code=${inviteCode}`;
export const tournamentSubsPage = (tournamentId: number) => {
  return `/to/${tournamentId}/subs`;
};

export const sendouQInviteLink = (inviteCode: string) =>
  `${SENDOUQ_PAGE}?${JOIN_CODE_SEARCH_PARAM_KEY}=${inviteCode}`;

export const sendouQMatchPage = (id: GroupMatch["id"]) => {
  return `${SENDOUQ_PAGE}/match/${id}`;
};

export const getWeaponUsage = ({
  userId,
  season,
  modeShort,
  stageId,
}: {
  userId: number;
  season: number;
  modeShort: ModeShort;
  stageId: StageId;
}) => {
  return `/weapon-usage?userId=${userId}&season=${season}&modeShort=${modeShort}&stageId=${stageId}`;
};

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
          args.abilities.join(","),
        )}`
      : ""
  }`;
export const objectDamageCalculatorPage = (weaponId?: MainWeaponId) =>
  `/object-damage-calculator${
    typeof weaponId === "number" ? `?weapon=${weaponId}` : ""
  }`;

export const uploadImagePage = (type: ImageUploadType) =>
  `/upload?type=${type}`;

export const vodVideoPage = (videoId: number) => `${VODS_PAGE}/${videoId}`;

export const badgeUrl = ({
  code,
  extension,
}: {
  code: Badge["code"];
  extension?: "gif";
}) => `/static-assets/badges/${code}${extension ? `.${extension}` : ""}`;
export const articlePreviewUrl = (slug: string) =>
  `/static-assets/img/article-previews/${slug}.png`;

export const navIconUrl = (navItem: (typeof navItems)[number]["name"]) =>
  `/static-assets/img/layout/${navItem}`;
export const gearImageUrl = (gearType: GearType, gearSplId: number) =>
  `/static-assets/img/gear/${gearType.toLowerCase()}/${gearSplId}`;
export const weaponCategoryUrl = (
  category: (typeof weaponCategories)[number]["name"],
) => `/static-assets/img/weapon-categories/${category}`;
export const mainWeaponImageUrl = (mainWeaponSplId: MainWeaponId) =>
  `/static-assets/img/main-weapons/${mainWeaponSplId}`;
export const outlinedMainWeaponImageUrl = (mainWeaponSplId: MainWeaponId) =>
  `/static-assets/img/main-weapons-outlined/${mainWeaponSplId}`;
export const outlinedFiveStarMainWeaponImageUrl = (
  mainWeaponSplId: MainWeaponId,
) => `/static-assets/img/main-weapons-outlined-2/${mainWeaponSplId}`;
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
export const brandImageUrl = (brand: "tentatek" | "takoroka") =>
  `/static-assets/img/layout/${brand}`;
export const tierImageUrl = (tier: TierName | "CALCULATING") =>
  `/static-assets/img/tiers/${tier.toLowerCase()}`;
export const preferenceEmojiUrl = (preference?: Preference) => {
  const emoji =
    preference === "PREFER"
      ? "grin"
      : preference === "AVOID"
        ? "unamused"
        : "no-mouth";

  return `/static-assets/img/emoji/${emoji}.svg`;
};
export const tournamentLogoUrl = (identifier: string) =>
  `/static-assets/img/tournament-logos/${identifier}.png`;
export const TIER_PLUS_URL = `/static-assets/img/tiers/plus`;

export const winnersImageUrl = ({
  season,
  placement,
}: {
  season: number;
  placement: number;
}) => `/static-assets/img/winners/${season}/${placement}`;

export const stageMinimapImageUrlWithEnding = ({
  stageId,
  mode,
  style,
}: {
  stageId: StageId;
  mode: ModeShort;
  style: StageBackgroundStyle;
}) =>
  staticAssetsUrl({
    folder: "planner-maps",
    fileName: `${stageId}-${mode}-${style}.png`,
  });

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
