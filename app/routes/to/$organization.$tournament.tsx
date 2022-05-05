// TODO: 404 page that shows other tournaments by the organization

import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Outlet, ShouldReloadFunction, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { CheckinActions } from "~/components/tournament/CheckinActions";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import {
  membershipStatus,
  tournamentHasStarted,
} from "~/core/tournament/utils";
import { db } from "~/db";
import { TournamentTeamFindManyByTournamentId } from "~/db/models/tournamentTeam";
import { useUserNew } from "~/hooks/common";
import { checkIn, FindTournamentByNameForUrlI } from "~/services/tournament";
import {
  getUserNew,
  makeTitle,
  MyCSSProperties,
  notFoundIfFalsy,
  PageTitle,
  requireUser,
  secondsToMilliseconds,
} from "~/utils";
import { chatRoute } from "~/utils/urls";
import tournamentStylesUrl from "../../styles/tournament.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tournamentStylesUrl }];
};

export const action: ActionFunction = async ({ request, context }) => {
  const data = Object.fromEntries(await request.formData());
  const user = requireUser(context);

  invariant(typeof data.teamId === "string", "Invalid type for teamId");
  await checkIn({ teamId: data.teamId, userId: user.id });
  return new Response(undefined, { status: 200 });
};

export type TournamentLoaderData = {
  teams: TournamentTeamFindManyByTournamentId;
  /** Bracket id to link to. If undefined means tournament has not started yet */
  bracketId?: number;
  membershipStatus: "CAPTAIN" | "NOT-CAPTAIN" | "NOT-REGISTERED";
  isTournamentAdmin: boolean;
  theme: {
    bannerBackground: string;
    textColor: string;
    textColorTransparent: string;
  };
  checkIn: {
    checkedIn: boolean;
    enoughPlayers: boolean;
    startTimestamp: number;
    endTimestamp: number;
  };
  concluded: boolean;
} & PageTitle;

export const tournamentParamsSchema = z.object({
  organization: z.string(),
  tournament: z.string(),
});

export const loader: LoaderFunction = ({ params, context }) => {
  const user = getUserNew(context);
  const namesForUrl = tournamentParamsSchema.parse(params);

  const tournament = notFoundIfFalsy(
    db.tournament.findByNamesForUrl(namesForUrl)
  );

  const teams = db.tournamentTeam.findManyByTournamentId(tournament.id);

  const ownTeam = teams.find((t) => t.members.some((m) => m.id === user?.id));

  return json<TournamentLoaderData>({
    pageTitle: tournament.name,
    theme: {
      bannerBackground: tournament.banner_background,
      textColor: tournament.banner_text_color,
      textColorTransparent: tournament.banner_text_color_transparent,
    },
    teams,
    isTournamentAdmin: db.tournament.isAdmin({
      userId: user?.id,
      tournamentId: tournament.id,
    }),
    membershipStatus: membershipStatus({ userId: user?.id, team: ownTeam }),
    bracketId: db.tournamentBracket.activeIdByTournamentId(tournament.id),
    checkIn: {
      checkedIn: Boolean(ownTeam?.checked_in_timestamp),
      enoughPlayers:
        (ownTeam?.members ?? []).length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
      startTimestamp: secondsToMilliseconds(
        tournament.check_in_start_timestamp
      ),
      endTimestamp: tournament.start_time_timestamp,
    },
    concluded: Boolean(tournament.is_concluded),
  });
};

export const meta: MetaFunction = (props) => {
  const data = props.data as FindTournamentByNameForUrlI | undefined;

  return {
    title: makeTitle(data?.name),
  };
};

export const unstable_shouldReload: ShouldReloadFunction = (data) => {
  if (data.submission?.action === chatRoute()) return false;
  const action = data.submission?.formData.get("_action");
  if (!action) return true;
  return !["REPORT_SCORE", "UNDO_REPORT_SCORE"].includes(String(action));
};

export default function TournamentPage() {
  const data = useLoaderData<TournamentLoaderData>();

  const navLinks = () => {
    const result: { code: string; text: string }[] = [
      { code: "", text: "Overview" },
      { code: "map-pool", text: "Map Pool" },
      { code: "teams", text: `Teams (${data.teams.length})` },
    ];
    const tournamentIsOver = false;

    if (data.bracketId) {
      result.push({ code: `bracket/${data.bracketId}`, text: "Bracket" });

      // TODO: add streams page
      // eslint-disable-next-line no-constant-condition
      if (!tournamentIsOver && false) {
        result.push({ code: "streams", text: "Streams (4)" });
      }
    }

    if (data.isTournamentAdmin) {
      result.push({
        code: "manage",
        text: "Controls",
      });
      if (!data.bracketId) {
        result.push({ code: "seeds", text: "Seeds" });
      }
      if (!tournamentHasStarted) result.push({ code: "start", text: "Start" });
    }

    return result;
  };

  const tournamentContainerStyle: MyCSSProperties = {
    "--tournaments-bg": data.theme.bannerBackground,
    "--tournaments-text": data.theme.textColor,
    "--tournaments-text-transparent": data.theme.textColorTransparent,
  };

  return (
    <div className="tournament__container" style={tournamentContainerStyle}>
      <SubNav>
        {navLinks().map((link) => (
          <SubNavLink key={link.code} to={link.code}>
            {link.text}
          </SubNavLink>
        ))}
        <MyTeamLink />
      </SubNav>
      <div className="tournament__container__spacer" />
      <CheckinActions />
      <div className="tournament__outlet-spacer" />
      {/* TODO: pass context instead of useMatches */}
      <Outlet />
    </div>
  );
}

function MyTeamLink() {
  const data = useLoaderData<TournamentLoaderData>();
  const user = useUserNew();

  if (data.membershipStatus === "NOT-CAPTAIN") return null;
  if (data.membershipStatus === "CAPTAIN") {
    return (
      <SubNavLink
        to="manage-team"
        className="info-banner__action-button"
        prefetch="intent"
      >
        Add players
      </SubNavLink>
    );
  }

  if (data.bracketId) {
    return null;
  }

  // TODO: prompt user to log in if not logged in
  // if (!user) {
  //   return (
  //     <form action={getLogInUrl(location)} method="post">
  //       <button
  //         className="info-banner__action-button"
  //         data-cy="log-in-to-join-button"
  //       >
  //         Log in to join
  //       </button>
  //     </form>
  //   );
  // }
  if (!user) return null;

  return (
    <SubNavLink
      to="register"
      className="info-banner__action-button"
      data-cy="register-button"
    >
      Register
    </SubNavLink>
  );
}
