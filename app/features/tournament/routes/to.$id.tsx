import type {
  LinksFunction,
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  type ShouldRevalidateFunction,
} from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { getUser } from "~/modules/auth/user.server";
import { canAdminTournament } from "~/permissions";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable, type Unpacked } from "~/utils/types";
import { streamsByTournamentId } from "../core/streams.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { teamHasCheckedIn, tournamentIdFromParams } from "../tournament-utils";
import styles from "../tournament.css";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { findSubsByTournamentId } from "~/features/tournament-subs";

export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  const wasMutation = args.formMethod === "post";
  const wasOnMatchPage = args.formAction?.includes("matches");

  if (wasMutation && wasOnMatchPage) {
    return false;
  }

  const wasRevalidation = !args.formMethod;

  if (wasRevalidation) {
    return false;
  }

  return args.defaultShouldRevalidate;
};

export const meta: V2_MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return [];

  return [{ title: makeTitle(data.event.name) }];
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["tournament", "calendar"],
};

export type TournamentLoaderTeam = Unpacked<TournamentLoaderData["teams"]>;
export type TournamentLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  const tournamentId = tournamentIdFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(tournamentId));

  const hasStarted = hasTournamentStarted(tournamentId);
  let teams = findTeamsByTournamentId(tournamentId);
  if (hasStarted) {
    teams = teams.filter(teamHasCheckedIn);
  }

  const teamMemberOfName = teams.find((team) =>
    team.members.some((member) => member.userId === user?.id)
  )?.name;

  const subsCount = findSubsByTournamentId({
    tournamentId,
    userId: user?.id,
    // eslint-disable-next-line array-callback-return
  }).filter((sub) => {
    if (sub.visibility === "ALL") return true;

    const userPlusTier = user?.plusTier ?? 4;

    switch (sub.visibility) {
      case "+1": {
        return userPlusTier === 1;
      }
      case "+2": {
        return userPlusTier <= 2;
      }
      case "+3": {
        return userPlusTier <= 3;
      }
      default: {
        assertUnreachable(sub.visibility);
      }
    }
  }).length;

  return {
    event,
    tieBreakerMapPool: db.calendarEvents.findTieBreakerMapPoolByEventId(
      event.eventId
    ),
    ownTeam: user
      ? findOwnTeam({
          tournamentId,
          userId: user.id,
        })
      : null,
    teamMemberOfName,
    teams,
    hasStarted,
    subsCount,
    streamsCount: hasStarted
      ? (await streamsByTournamentId(tournamentId)).length
      : 0,
  };
};

// TODO: icons to nav could be nice
export default function TournamentLayout() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const location = useLocation();

  const onBracketsPage = location.pathname.includes("brackets");

  return (
    <Main bigger={onBracketsPage}>
      <SubNav>
        {!data.hasStarted ? (
          <SubNavLink to="register" data-testid="register-tab">
            {t("tournament:tabs.register")}
          </SubNavLink>
        ) : null}
        <SubNavLink to="brackets" data-testid="brackets-tab">
          {t("tournament:tabs.brackets")}
        </SubNavLink>
        {data.event.showMapListGenerator ? (
          <SubNavLink to="maps">{t("tournament:tabs.maps")}</SubNavLink>
        ) : null}
        <SubNavLink to="teams" end={false}>
          {t("tournament:tabs.teams", { count: data.teams.length })}
        </SubNavLink>
        {/* TODO: don't show when tournament finalized */}
        <SubNavLink to="subs" end={false}>
          {t("tournament:tabs.subs", { count: data.subsCount })}
        </SubNavLink>
        {/* TODO: don't show when tournament finalized */}
        {data.hasStarted ? (
          <SubNavLink to="streams">
            {t("tournament:tabs.streams", { count: data.streamsCount })}
          </SubNavLink>
        ) : null}
        {canAdminTournament({ user, event: data.event }) &&
          !data.hasStarted && (
            <SubNavLink to="seeds">{t("tournament:tabs.seeds")}</SubNavLink>
          )}
        {canAdminTournament({ user, event: data.event }) && (
          <SubNavLink to="admin" data-testid="admin-tab">
            {t("tournament:tabs.admin")}
          </SubNavLink>
        )}
      </SubNav>
      <Outlet context={data} />
    </Main>
  );
}
