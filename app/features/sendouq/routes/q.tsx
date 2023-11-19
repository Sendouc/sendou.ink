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
import {
  DEFAULT_SKILL_HIGH,
  DEFAULT_SKILL_LOW,
  DEFAULT_SKILL_MID,
} from "~/features/mmr/mmr-constants";
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
  LOG_IN_URL,
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  SENDOUQ_RULES_PAGE,
  SENDOUQ_YOUTUBE_VIDEO,
  navIconUrl,
} from "~/utils/urls";
import { FULL_GROUP_SIZE, JOIN_CODE_SEARCH_PARAM_KEY } from "../q-constants";
import { frontPageSchema } from "../q-schemas.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import styles from "../q.css";
import { addInitialSkill } from "../queries/addInitialSkill.server";
import { addMember } from "../queries/addMember.server";
import { deleteLikesByGroupId } from "../queries/deleteLikesByGroupId.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { findGroupByInviteCode } from "../queries/findGroupByInviteCode.server";
import { userHasSkill } from "../queries/userHasSkill.server";

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
      validate(
        userHasSkill({ userId: user.id, season: season.nth }),
        "Initial SP needs to be set first",
      );
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
    case "SET_INITIAL_SP": {
      validate(
        !userHasSkill({ userId: user.id, season: season.nth }),
        "Already set initial SP",
      );

      const defaultSkill =
        data.tier === "higher"
          ? DEFAULT_SKILL_HIGH
          : data.tier === "default"
          ? DEFAULT_SKILL_MID
          : DEFAULT_SKILL_LOW;

      addInitialSkill({
        mu: defaultSkill.mu,
        season: season.nth,
        sigma: defaultSkill.sigma,
        userId: user.id,
      });

      return null;
    }
    default: {
      assertUnreachable(data);
    }
  }
};

// xxx: remove map picking from here, link to settings
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
    hasSkill:
      season && user
        ? userHasSkill({ userId: user.id, season: season.nth })
        : null,
    season,
    upcomingSeason,
    groupInvitedTo,
  };
};

export default function QPage() {
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
          Watch introduction video on YouTube by Chara
        </a>
      </div>
      {data.upcomingSeason ? (
        <UpcomingSeasonInfo season={data.upcomingSeason} />
      ) : null}
      {data.season ? (
        <>
          {data.hasSkill && data.groupInvitedTo === null ? (
            <Alert variation="WARNING">
              Invite code doesn&apos;t match any active team
            </Alert>
          ) : null}
          {data.groupInvitedTo &&
          data.groupInvitedTo.members.length < FULL_GROUP_SIZE &&
          data.hasSkill ? (
            <JoinTeamDialog
              open={dialogOpen}
              close={() => setDialogOpen(false)}
              members={data.groupInvitedTo.members}
            />
          ) : null}
          {!data.hasSkill && user ? <StartRank /> : null}
          {user && data.hasSkill ? (
            <>
              <fetcher.Form className="stack md" method="post">
                <input type="hidden" name="_action" value="JOIN_QUEUE" />
                <div>
                  <div className="stack horizontal items-center justify-between">
                    <h2 className="q__header">Join the queue!</h2>
                    <Link to={SENDOUQ_RULES_PAGE} className="text-xs font-bold">
                      Rules
                    </Link>
                  </div>
                  <ActiveSeasonInfo season={data.season} />
                </div>
                <div className="stack horizontal md items-center mt-4 mx-auto">
                  <SubmitButton icon={<UsersIcon />}>
                    Join with mates
                  </SubmitButton>
                  <SubmitButton
                    name="direct"
                    value="true"
                    state={fetcher.state}
                    icon={<UserIcon />}
                    variant="outlined"
                  >
                    Join solo
                  </SubmitButton>
                </div>
              </fetcher.Form>
            </>
          ) : null}
          {!user ? (
            <form
              className="stack items-center"
              action={LOG_IN_URL}
              method="post"
            >
              <Button size="big" type="submit">
                Log in to join SendouQ
              </Button>
            </form>
          ) : null}
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
    city: "Los Angeles",
  },
  { id: 2, countryCode: "US", timeZone: "America/New_York", city: "New York" },
  { id: 3, countryCode: "FR", timeZone: "Europe/Paris", city: "Paris" },
  { id: 4, countryCode: "JP", timeZone: "Asia/Tokyo", city: "Tokyo" },
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
  const { i18n } = useTranslation();
  useAutoRerender();

  return (
    <div className="q__clocks-container">
      {countries.map((country) => {
        return (
          <div key={country.id} className="q__clock">
            <div className="q__clock-country">{country.city}</div>
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
      Join the group with{" "}
      {joinListToNaturalString(members.map((m) => m.discordName))}?
      <fetcher.Form
        className="stack horizontal justify-center sm mt-4 flex-wrap"
        method="post"
      >
        <SubmitButton _action="JOIN_TEAM" state={fetcher.state}>
          Join
        </SubmitButton>
        <SubmitButton
          _action="JOIN_TEAM_WITH_TRUST"
          state={fetcher.state}
          variant="outlined"
        >
          Join & trust {owner.discordName}
        </SubmitButton>
        <Button onClick={close} variant="destructive">
          No thanks
        </Button>
        <FormMessage type="info">
          Trusting a user allows them to add you to groups without an invite
          link in the future
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
  const isMounted = useIsMounted();

  const starts = new Date(season.starts);
  const ends = new Date(season.ends);

  const dateToString = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  return (
    <div
      className={clsx("text-lighter text-xs", {
        invisible: !isMounted,
      })}
    >
      Season {season.nth} open{" "}
      {isMounted ? (
        <b>
          {dateToString(starts)} - {dateToString(ends)}
        </b>
      ) : null}
    </div>
  );
}

function UpcomingSeasonInfo({
  season,
}: {
  season: SerializeFrom<RankingSeason>;
}) {
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
      It&apos;s off-season!
      <br />
      Join Season {season.nth} starting {dateToString(starts)}
    </div>
  );
}

// xxx: get rid of this
function StartRank() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" className="stack md items-start">
      <div>
        <label>Starting rank</label>
        {["higher", "default", "lower"].map((tier) => {
          return (
            <div key={tier} className="stack sm horizontal items-center">
              <input
                type="radio"
                name="tier"
                id={tier}
                value={tier}
                defaultChecked={tier === "default"}
              />
              <label htmlFor={tier} className="mb-0 text-capitalize">
                {tier}
              </label>
            </div>
          );
        })}
        <FormMessage type="info">
          Decides your starting SP (MMR). &quot;Higher&quot; is recommended for
          Plus Server level players. &quot;Lower&quot; for Low Ink eligible
          players. &quot;Default&quot; for everyone else.
        </FormMessage>
        <FormMessage type="info" className="font-bold">
          Setting initial SP is mandatory before you can join SendouQ.
        </FormMessage>
      </div>
      <SubmitButton _action="SET_INITIAL_SP" state={fetcher.state}>
        Submit
      </SubmitButton>
    </fetcher.Form>
  );
}
