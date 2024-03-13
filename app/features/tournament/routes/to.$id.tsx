import type {
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
import { useUser } from "~/features/auth/core/user";
import { getUser } from "~/features/auth/core/user.server";
import { Tournament } from "~/features/tournament-bracket/core/Tournament";
import { tournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import { findSubsByTournamentId } from "~/features/tournament-subs";
import { type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { streamsByTournamentId } from "../core/streams.server";
import { tournamentIdFromParams } from "../tournament-utils";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { databaseTimestampToDate } from "~/utils/dates";
import { isAdmin } from "~/permissions";

import "../tournament.css";
import "~/styles/maps.css";
import "~/styles/calendar-event.css";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return [];

  return [{ title: makeTitle(data.tournament.ctx.name) }];
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

  const streams =
    tournament.ctx.inProgressBrackets.length > 0
      ? await streamsByTournamentId({
          tournamentId,
          castTwitchAccounts: tournament.ctx.castTwitchAccounts,
        })
      : [];

  const tournamentStartedInTheLastMonth =
    databaseTimestampToDate(tournament.ctx.startTime) >
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const isTournamentAdmin =
    tournament.ctx.author.id === user?.id ||
    tournament.ctx.staff.some(
      (s) => s.role === "ORGANIZER" && s.id === user?.id,
    ) ||
    isAdmin(user);
  const showFriendCodes = tournamentStartedInTheLastMonth && isTournamentAdmin;

  return {
    tournament,
    subsCount,
    streamingParticipants: streams.flatMap((s) => (s.userId ? [s.userId] : [])),
    streamsCount: streams.length,
    toSetMapPool:
      tournament.ctx.mapPickingStyle === "TO"
        ? await TournamentRepository.findTOSetMapPoolById(tournamentId)
        : [],
    friendCode: user
      ? await UserRepository.currentFriendCodeByUserId(user.id)
      : undefined,
    friendCodes: showFriendCodes
      ? await TournamentRepository.friendCodesByTournamentId(tournamentId)
      : undefined,
  };
};

const TournamentContext = React.createContext<Tournament>(null!);

export default function TournamentLayout() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const tournament = React.useMemo(
    () => new Tournament(data.tournament),
    [data],
  );
  const [bracketExpanded, setBracketExpanded] = React.useState(true);

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
            {t("tournament:tabs.streams", {
              count: data.streamsCount,
            })}
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
        <Outlet
          context={
            {
              tournament,
              bracketExpanded,
              setBracketExpanded,
              streamingParticipants: data.streamingParticipants,
              friendCode: data.friendCode,
              friendCodes: data.friendCodes,
              toSetMapPool: data.toSetMapPool,
            } satisfies TournamentContext
          }
        />
      </TournamentContext.Provider>
    </Main>
  );
}

type TournamentContext = {
  tournament: Tournament;
  bracketExpanded: boolean;
  streamingParticipants: number[];
  setBracketExpanded: (expanded: boolean) => void;
  friendCode?: string;
  friendCodes?: SerializeFrom<typeof loader>["friendCodes"];
  toSetMapPool: SerializeFrom<typeof loader>["toSetMapPool"];
};

export function useTournament() {
  return useOutletContext<TournamentContext>().tournament;
}

export function useBracketExpanded() {
  const { bracketExpanded, setBracketExpanded } =
    useOutletContext<TournamentContext>();

  return { bracketExpanded, setBracketExpanded };
}

export function useStreamingParticipants() {
  return useOutletContext<TournamentContext>().streamingParticipants;
}

export function useTournamentFriendCode() {
  return useOutletContext<TournamentContext>().friendCode;
}

export function useTournamentFriendCodes() {
  return useOutletContext<TournamentContext>().friendCodes;
}

export function useTournamentToSetMapPool() {
  return useOutletContext<TournamentContext>().toSetMapPool;
}
