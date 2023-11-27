import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { Flag } from "~/components/Flag";
import { FormMessage } from "~/components/FormMessage";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { UserIcon } from "~/components/icons/User";
import { UsersIcon } from "~/components/icons/Users";
import { sql } from "~/db/sql";
import type { GroupMember } from "~/db/types";
import { useUser } from "~/features/auth/core";
import { getUserId, requireUserId } from "~/features/auth/core/user.server";
import { currentSeason } from "~/features/mmr";
import type { RankingSeason } from "~/features/mmr/season";
import { nextSeason } from "~/features/mmr/season";
import * as QRepository from "~/features/sendouq/QRepository.server";
import { giveTrust } from "~/features/tournament/queries/giveTrust.server";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "~/hooks/useTranslation";
import { joinListToNaturalString } from "~/utils/arrays";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import {
  LEADERBOARDS_PAGE,
  LOG_IN_URL,
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  SENDOUQ_RULES_PAGE,
  SENDOUQ_SETTINGS_PAGE,
  SENDOUQ_YOUTUBE_VIDEO,
  navIconUrl,
  userSeasonsPage,
} from "~/utils/urls";
import { FULL_GROUP_SIZE, JOIN_CODE_SEARCH_PARAM_KEY } from "../q-constants";
import { frontPageSchema } from "../q-schemas.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import styles from "../q.css";
import { addMember } from "../queries/addMember.server";
import { deleteLikesByGroupId } from "../queries/deleteLikesByGroupId.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { findGroupByInviteCode } from "../queries/findGroupByInviteCode.server";
import { Image } from "~/components/Image";

export const handle: SendouRouteHandle = {
  i18n: ["q"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_PAGE,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: makeTitle("SendouQ") },
    {
      name: "description",
      content:
        "Splatoon 3 competitive ladder. Join by yourself or with your team and play ranked matches.",
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: frontPageSchema,
  });

  const season = currentSeason(new Date());
  validate(season, "Season is not active");
  validate(!findCurrentGroupByUserId(user.id), "Already in a group");

  switch (data._action) {
    case "JOIN_QUEUE": {
      await QRepository.createGroup({
        status: data.direct === "true" ? "ACTIVE" : "PREPARING",
        userId: user.id,
      });

      return redirect(
        data.direct === "true" ? SENDOUQ_LOOKING_PAGE : SENDOUQ_PREPARING_PAGE,
      );
    }
    case "JOIN_TEAM_WITH_TRUST":
    case "JOIN_TEAM": {
      const code = new URL(request.url).searchParams.get(
        JOIN_CODE_SEARCH_PARAM_KEY,
      );

      const groupInvitedTo =
        code && user ? findGroupByInviteCode(code) : undefined;
      validate(groupInvitedTo, "Invite code doesn't match any active team");
      validate(groupInvitedTo.members.length < FULL_GROUP_SIZE, "Team is full");

      sql.transaction(() => {
        addMember({
          groupId: groupInvitedTo.id,
          userId: user.id,
        });
        deleteLikesByGroupId(groupInvitedTo.id);

        if (data._action === "JOIN_TEAM_WITH_TRUST") {
          const owner = groupInvitedTo.members.find((m) => m.role === "OWNER");
          invariant(owner, "Owner not found");

          giveTrust({
            trustGiverUserId: user.id,
            trustReceiverUserId: owner.id,
          });
        }
      })();

      return redirect(
        groupInvitedTo.status === "PREPARING"
          ? SENDOUQ_PREPARING_PAGE
          : SENDOUQ_LOOKING_PAGE,
      );
    }
    default: {
      assertUnreachable(data);
    }
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const code = new URL(request.url).searchParams.get(
    JOIN_CODE_SEARCH_PARAM_KEY,
  );

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findCurrentGroupByUserId(user.id) : undefined,
    currentLocation: "default",
  });

  if (redirectLocation) {
    throw redirect(`${redirectLocation}${code ? "?joining=true" : ""}`);
  }

  const groupInvitedTo = code && user ? findGroupByInviteCode(code) : undefined;

  const now = new Date();
  const season = currentSeason(now);
  const upcomingSeason = !season ? nextSeason(now) : undefined;

  return {
    season,
    upcomingSeason,
    groupInvitedTo,
  };
};

export default function QPage() {
  const { t } = useTranslation(["q"]);
  const [dialogOpen, setDialogOpen] = React.useState(true);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <Main halfWidth className="stack lg">
      <div className="stack sm">
        <Clocks />
        <a
          href={SENDOUQ_YOUTUBE_VIDEO}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-center"
        >
          {t("q:front.watchVideo")}
        </a>
      </div>
      <QLinks />
      {data.upcomingSeason ? (
        <UpcomingSeasonInfo season={data.upcomingSeason} />
      ) : null}
      {data.season ? (
        <>
          {data.groupInvitedTo === null ? (
            <Alert variation="WARNING">{t("q:front.inviteCodeWrong")}</Alert>
          ) : null}
          {data.groupInvitedTo &&
          data.groupInvitedTo.members.length < FULL_GROUP_SIZE ? (
            <JoinTeamDialog
              open={dialogOpen}
              close={() => setDialogOpen(false)}
              members={data.groupInvitedTo.members}
            />
          ) : null}
          {user ? (
            <>
              <fetcher.Form className="stack md" method="post">
                <input type="hidden" name="_action" value="JOIN_QUEUE" />
                <div className="stack horizontal md items-center mt-4 mx-auto">
                  <SubmitButton icon={<UsersIcon />}>
                    {t("q:front.actions.joinWithGroup")}
                  </SubmitButton>
                  <SubmitButton
                    name="direct"
                    value="true"
                    state={fetcher.state}
                    icon={<UserIcon />}
                    variant="outlined"
                  >
                    {t("q:front.actions.joinSolo")}
                  </SubmitButton>
                </div>
                <ActiveSeasonInfo season={data.season} />
              </fetcher.Form>
            </>
          ) : (
            <form
              className="stack items-center"
              action={LOG_IN_URL}
              method="post"
            >
              <Button size="big" type="submit">
                {t("q:front.actions.logIn")}
              </Button>
            </form>
          )}
        </>
      ) : null}
    </Main>
  );
}

const countries = [
  {
    id: 1,
    countryCode: "US",
    timeZone: "America/Los_Angeles",
    city: "la",
  },
  { id: 2, countryCode: "US", timeZone: "America/New_York", city: "nyc" },
  { id: 3, countryCode: "FR", timeZone: "Europe/Paris", city: "paris" },
  { id: 4, countryCode: "JP", timeZone: "Asia/Tokyo", city: "tokyo" },
] as const;
const weekdayFormatter = ({
  timeZone,
  locale,
}: {
  timeZone: string;
  locale: string;
}) =>
  new Intl.DateTimeFormat([locale], {
    timeZone,
    weekday: "long",
  });
const clockFormatter = ({
  timeZone,
  locale,
}: {
  timeZone: string;
  locale: string;
}) =>
  new Intl.DateTimeFormat([locale], {
    timeZone,
    hour: "numeric",
    minute: "numeric",
  });
function Clocks() {
  const isMounted = useIsMounted();
  const { t, i18n } = useTranslation(["q"]);
  useAutoRerender();

  return (
    <div className="q__clocks-container">
      {countries.map((country) => {
        return (
          <div key={country.id} className="q__clock">
            <div className="q__clock-country">
              {t(`q:front.cities.${country.city}`)}
            </div>
            <Flag countryCode={country.countryCode} />
            <div className={clsx({ invisible: !isMounted })}>
              {isMounted
                ? weekdayFormatter({
                    timeZone: country.timeZone,
                    locale: i18n.language,
                  }).format(new Date())
                : // take space
                  "Monday"}
            </div>
            <div className={clsx({ invisible: !isMounted })}>
              {isMounted
                ? clockFormatter({
                    timeZone: country.timeZone,
                    locale: i18n.language,
                  }).format(new Date())
                : // take space
                  "0:00 PM"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JoinTeamDialog({
  open,
  close,
  members,
}: {
  open: boolean;
  close: () => void;
  members: {
    discordName: string;
    role: GroupMember["role"];
  }[];
}) {
  const { t } = useTranslation(["q"]);
  const fetcher = useFetcher();

  const owner = members.find((m) => m.role === "OWNER");
  invariant(owner, "Owner not found");

  return (
    <Dialog
      isOpen={open}
      close={close}
      closeOnAnyClick={false}
      className="text-center"
    >
      {t("q:front.join.header", {
        members: joinListToNaturalString(members.map((m) => m.discordName)),
      })}
      <fetcher.Form
        className="stack horizontal justify-center sm mt-4 flex-wrap"
        method="post"
      >
        <SubmitButton _action="JOIN_TEAM" state={fetcher.state}>
          {t("q:front.join.joinAction")}
        </SubmitButton>
        <SubmitButton
          _action="JOIN_TEAM_WITH_TRUST"
          state={fetcher.state}
          variant="outlined"
        >
          {t("q:front.join.joinWithTrustAction", {
            inviterName: owner.discordName,
          })}
        </SubmitButton>
        <Button onClick={close} variant="destructive">
          {t("q:front.join.refuseAction")}
        </Button>
        <FormMessage type="info">
          {t("q:front.join.joinWithTrustAction.explanation")}
        </FormMessage>
      </fetcher.Form>
    </Dialog>
  );
}

function ActiveSeasonInfo({
  season,
}: {
  season: SerializeFrom<RankingSeason>;
}) {
  const { t, i18n } = useTranslation(["q"]);
  const isMounted = useIsMounted();

  const starts = new Date(season.starts);
  const ends = new Date(season.ends);

  const dateToString = (date: Date) =>
    date.toLocaleString(i18n.language, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  return (
    <div
      className={clsx("text-lighter text-xs text-center", {
        invisible: !isMounted,
      })}
    >
      {t("q:front.seasonOpen", { nth: season.nth })}{" "}
      {isMounted ? (
        <b>
          {dateToString(starts)} - {dateToString(ends)}
        </b>
      ) : null}
    </div>
  );
}

// xxx: todo icons
function QLinks() {
  const { t } = useTranslation(["q"]);
  const user = useUser();

  return (
    <div className="stack sm">
      <QLink
        navIcon="settings"
        url={SENDOUQ_RULES_PAGE}
        title={t("q:front.nav.rules.title")}
        subText={t("q:front.nav.rules.description")}
      />
      {user ? (
        <QLink
          navIcon="settings"
          url={SENDOUQ_SETTINGS_PAGE}
          title={t("q:front.nav.settings.title")}
          subText={t("q:front.nav.settings.description")}
        />
      ) : null}
      <QLink
        navIcon="leaderboards"
        url={LEADERBOARDS_PAGE}
        title={t("q:front.nav.leaderboards.title")}
        subText={t("q:front.nav.leaderboards.description")}
      />
      {user ? (
        <QLink
          navIcon="u"
          url={userSeasonsPage({ user })}
          title={t("q:front.nav.mySeason.title")}
          subText={t("q:front.nav.mySeason.description")}
        />
      ) : null}
    </div>
  );
}

function QLink({
  url,
  navIcon,
  title,
  subText,
}: {
  url: string;
  navIcon: string;
  title: string;
  subText: string;
}) {
  return (
    <Link to={url} className="q__front-page-link">
      <Image path={navIconUrl(navIcon)} alt="" width={32} />
      <div>
        {title}
        <div className="q__front-page-link__sub-text">{subText}</div>
      </div>
    </Link>
  );
}

function UpcomingSeasonInfo({
  season,
}: {
  season: SerializeFrom<RankingSeason>;
}) {
  const { t } = useTranslation(["q"]);
  const isMounted = useIsMounted();
  if (!isMounted) return null;

  const starts = new Date(season.starts);

  const dateToString = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
    });

  return (
    <div className="font-semi-bold text-center text-sm">
      {t("q:front.upcomingSeason.header")}
      <br />
      {t("q:front.upcomingSeason.date", {
        nth: season.nth,
        date: dateToString(starts),
      })}
    </div>
  );
}
