import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  Outlet,
  type ShouldRevalidateFunction,
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
import {
  HACKY_resolvePicture,
  tournamentIdFromParams,
} from "../tournament-utils";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { databaseTimestampToDate } from "~/utils/dates";
import { isAdmin } from "~/permissions";
import { tournamentPage, userSubmittedImage } from "~/utils/urls";

import "../tournament.css";
import "~/styles/maps.css";
import "~/styles/calendar-event.css";

export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  const navigatedToMatchPage =
    typeof args.nextParams["mid"] === "string" && args.formMethod !== "POST";

  if (navigatedToMatchPage) return false;

  return args.defaultShouldRevalidate;
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return [];

  const title = makeTitle(data.tournament.ctx.name);

  return [
    { title },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: data.tournament.ctx.description,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:image",
      content: data.tournament.ctx.logoSrc,
    },
    // Twitter special snowflake tags, see https://developer.x.com/en/docs/twitter-for-websites/cards/overview/summary
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:site",
      content: "@sendouink",
    },
  ];
};

export const handle: SendouRouteHandle = {
  i18n: ["tournament", "calendar"],
  breadcrumb: ({ match }) => {
    const data = match.data as TournamentLoaderData | undefined;

    if (!data) return [];

    return [
      {
        imgPath: data.tournament.ctx.logoUrl
          ? userSubmittedImage(data.tournament.ctx.logoUrl)
          : HACKY_resolvePicture(data.tournament.ctx),
        href: tournamentPage(data.tournament.ctx.id),
        type: "IMAGE",
        text: data.tournament.ctx.name,
        rounded: true,
      },
    ];
  },
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
    tournament.data.stage.length > 0
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
        <SubNavLink to="register" data-testid="register-tab" prefetch="intent">
          {tournament.hasStarted ? "Info" : t("tournament:tabs.register")}
        </SubNavLink>
        <SubNavLink to="brackets" data-testid="brackets-tab" prefetch="render">
          {t("tournament:tabs.brackets")}
        </SubNavLink>
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
              friendCode: data.friendCode?.friendCode,
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
