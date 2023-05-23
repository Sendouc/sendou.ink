import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  type ShouldRevalidateFunction,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { getUserId } from "~/modules/auth/user.server";
import { canAdminTournament } from "~/permissions";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import type { FindTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { teamHasCheckedIn, tournamentIdFromParams } from "../tournament-utils";
import styles from "../tournament.css";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { streamsByTournamentId } from "../core/streams.server";

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
  const user = await getUserId(request);
  const tournamentId = tournamentIdFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(tournamentId));

  const mapListGeneratorAvailable =
    canAdminTournament({ user, event }) || event.showMapListGenerator;

  const hasStarted = hasTournamentStarted(tournamentId);
  let teams = findTeamsByTournamentId(tournamentId);
  if (hasStarted) {
    teams = teams.filter(teamHasCheckedIn);
  }

  const ownedTeamId = teams.find((team) =>
    team.members.some((member) => member.userId === user?.id && member.isOwner)
  )?.id;
  const teamMemberOfName = teams.find((team) =>
    team.members.some((member) => member.userId === user?.id)
  )?.name;

  return {
    event,
    tieBreakerMapPool: db.calendarEvents.findTieBreakerMapPoolByEventId(
      event.eventId
    ),
    ownedTeamId,
    teamMemberOfName,
    teams: censorMapPools(teams),
    mapListGeneratorAvailable,
    hasStarted,
    streamsCount: hasStarted
      ? (await streamsByTournamentId(tournamentId)).length
      : 0,
  };

  function censorMapPools(
    teams: FindTeamsByTournamentId
  ): FindTeamsByTournamentId {
    if (hasStarted || mapListGeneratorAvailable) return teams;

    return teams.map((team) =>
      team.id === ownedTeamId
        ? team
        : {
            ...team,
            mapPool: undefined,
          }
    );
  }
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
          Brackets
        </SubNavLink>
        {data.mapListGeneratorAvailable ? (
          <SubNavLink to="maps">{t("tournament:tabs.maps")}</SubNavLink>
        ) : null}
        <SubNavLink to="teams">
          {t("tournament:tabs.teams", { count: data.teams.length })}
        </SubNavLink>
        {/* TODO: don't show when tournament finalized */}
        {data.hasStarted ? (
          <SubNavLink to="streams">Streams ({data.streamsCount})</SubNavLink>
        ) : null}
        {canAdminTournament({ user, event: data.event }) &&
          !data.hasStarted && <SubNavLink to="seeds">Seeds</SubNavLink>}
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
