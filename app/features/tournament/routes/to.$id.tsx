import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useOutletContext,
} from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { useUser } from "~/features/auth/core";
import { getUser } from "~/features/auth/core/user.server";
import { Tournament } from "~/features/tournament-bracket/core/Tournament";
import { tournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import { findSubsByTournamentId } from "~/features/tournament-subs";
import { type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { streamsByTournamentId } from "../core/streams.server";
import { tournamentIdFromParams } from "../tournament-utils";
import styles from "../tournament.css";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return [];

  return [{ title: makeTitle(data.tournament.ctx.name) }];
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["tournament", "calendar"],
};

export type TournamentLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const tournamentId = tournamentIdFromParams(params);

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

  const tournament = await tournamentData({ tournamentId, user });

  return {
    tournament,
    subsCount,
    streamsCount:
      tournament.ctx.inProgressBrackets.length > 0
        ? (
            await streamsByTournamentId({
              tournamentId,
              castTwitchAccounts: tournament.ctx.castTwitchAccounts,
            })
          ).length
        : 0,
  };
};

const TournamentContext = React.createContext<Tournament>(null!);

// xxx: could slim down match response, e.g. remove child_count
// TODO: icons to nav could be nice
export default function TournamentLayout() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const tournament = React.useMemo(
    () => new Tournament(data.tournament),
    [data],
  );

  // this is nice to debug with tournament in browser console
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      // @ts-expect-error for dev purposes
      window.tourney = tournament;
    }, [tournament]);
  }

  const onBracketsPage = location.pathname.includes("brackets");

  return (
    <Main bigger={onBracketsPage}>
      <SubNav>
        {!tournament.hasStarted ? (
          <SubNavLink
            to="register"
            data-testid="register-tab"
            prefetch="render"
          >
            {t("tournament:tabs.register")}
          </SubNavLink>
        ) : null}
        <SubNavLink to="brackets" data-testid="brackets-tab" prefetch="render">
          {t("tournament:tabs.brackets")}
        </SubNavLink>
        {tournament.ctx.showMapListGenerator ? (
          <SubNavLink to="maps">{t("tournament:tabs.maps")}</SubNavLink>
        ) : null}
        <SubNavLink to="teams" end={false} prefetch="render">
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
        <Outlet context={tournament satisfies Tournament} />
      </TournamentContext.Provider>
    </Main>
  );
}

export function useTournament() {
  return useOutletContext<Tournament>();
}
