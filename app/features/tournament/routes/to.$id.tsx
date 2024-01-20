import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { useUser } from "~/features/auth/core";
import { getUser } from "~/features/auth/core/user.server";
import { Tournament } from "~/features/tournament-bracket/core/Tournament";
import { tournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import { findSubsByTournamentId } from "~/features/tournament-subs";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable, type Unpacked } from "~/utils/types";
import * as TournamentRepository from "../TournamentRepository.server";
import { streamsByTournamentId } from "../core/streams.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import hasTournamentFinalized from "../queries/hasTournamentFinalized.server";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { teamHasCheckedIn, tournamentIdFromParams } from "../tournament-utils";
import styles from "../tournament.css";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return [];

  return [{ title: makeTitle(data.tournament.name) }];
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["tournament", "calendar"],
};

export type TournamentLoaderTeam = Unpacked<TournamentLoaderData["teams"]>;
export type TournamentLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const tournamentId = tournamentIdFromParams(params);
  const tournament = notFoundIfFalsy(
    await TournamentRepository.findById(tournamentId),
  );

  const hasStarted = hasTournamentStarted(tournamentId);
  let teams = findTeamsByTournamentId(tournamentId);
  if (hasStarted) {
    const checkedInTeams = teams.filter(teamHasCheckedIn);
    // handle special case where tournament was started early
    if (checkedInTeams.length > 0) {
      teams = checkedInTeams;
    }
  }

  const teamMemberOfName = teams.find((team) =>
    team.members.some((member) => member.userId === user?.id),
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
    tournament,
    newTournament: await tournamentData({ tournamentId, user }),
    ownTeam: user
      ? findOwnTeam({
          tournamentId,
          userId: user.id,
        })
      : null,
    teamMemberOfName,
    teams,
    hasStarted,
    hasFinalized: hasTournamentFinalized(tournamentId),
    subsCount,
    streamsCount: hasStarted
      ? (
          await streamsByTournamentId({
            tournamentId,
            castTwitchAccounts: tournament.castTwitchAccounts,
          })
        ).length
      : 0,
  };
};

const TournamentContext = React.createContext<Tournament>(null!);

// TODO: icons to nav could be nice
export default function TournamentLayout() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const tournament = React.useMemo(
    () => new Tournament(data.newTournament),
    [data],
  );

  const onBracketsPage = location.pathname.includes("brackets");

  return (
    <Main bigger={onBracketsPage}>
      <SubNav>
        {!tournament.hasStarted ? (
          <SubNavLink to="register" data-testid="register-tab">
            {t("tournament:tabs.register")}
          </SubNavLink>
        ) : null}
        <SubNavLink to="brackets" data-testid="brackets-tab">
          {t("tournament:tabs.brackets")}
        </SubNavLink>
        {tournament.ctx.showMapListGenerator ? (
          <SubNavLink to="maps">{t("tournament:tabs.maps")}</SubNavLink>
        ) : null}
        <SubNavLink to="teams" end={false}>
          {t("tournament:tabs.teams", { count: tournament.ctx.teams.length })}
        </SubNavLink>
        {!tournament.everyBracketOver && tournament.subsFeatureEnabled && (
          <SubNavLink to="subs" end={false}>
            {t("tournament:tabs.subs", { count: data.subsCount })}
          </SubNavLink>
        )}
        {tournament.hasStarted && !tournament.everyBracketOver ? (
          <SubNavLink to="streams">
            {t("tournament:tabs.streams", { count: data.streamsCount })}
          </SubNavLink>
        ) : null}
        {tournament.isOrganizer(user) && !tournament.hasStarted && (
          <SubNavLink to="seeds">{t("tournament:tabs.seeds")}</SubNavLink>
        )}
        {tournament.isOrganizer(user) && !tournament.everyBracketOver && (
          <SubNavLink to="admin" data-testid="admin-tab">
            {t("tournament:tabs.admin")}
          </SubNavLink>
        )}
      </SubNav>
      <TournamentContext.Provider value={tournament}>
        <Outlet context={data} />
      </TournamentContext.Provider>
    </Main>
  );
}

export function useTournament() {
  return React.useContext(TournamentContext);
}
