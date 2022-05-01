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
import { tournamentHasStarted } from "~/core/tournament/utils";
import { db } from "~/db";
import { useUser } from "~/hooks/common";
import { checkIn, FindTournamentByNameForUrlI } from "~/services/tournament";
import { makeTitle, MyCSSProperties, PageTitle, requireUser } from "~/utils";
import { chatRoute } from "~/utils/urls";
import tournamentStylesUrl from "../../styles/tournament.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tournamentStylesUrl }];
};

// TODO: remove... this wont have more than one action
export enum TournamentAction {
  CHECK_IN = "CHECK_IN",
}

export const action: ActionFunction = async ({ request, context }) => {
  const data = Object.fromEntries(await request.formData());
  const user = requireUser(context);

  switch (data._action) {
    case TournamentAction.CHECK_IN: {
      invariant(typeof data.teamId === "string", "Invalid type for teamId");

      await checkIn({ teamId: data.teamId, userId: user.id });
      break;
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
  return new Response(undefined, { status: 200 });
};

export type TournamentLoaderData = {
  teamCount: number;
  tournamentHasStarted: boolean;
  bracketId: number;
  membershipStatus: "CAPTAIN" | "NOT-CAPTAIN" | "NOT-REGISTERED";
  isTournamentAdmin: boolean;
  theme: {
    bannerBackground: string;
    textColor: string;
    textColorTransparent: string;
  };
} & PageTitle;

const tournamentParamsSchema = z.object({
  organization: z.string(),
  tournament: z.string(),
});

export const loader: LoaderFunction = ({ params }) => {
  const namesForUrl = tournamentParamsSchema.parse(params);

  const tournament = db.tournament.findByNamesForUrl(namesForUrl);

  return json<TournamentLoaderData>({
    pageTitle: tournament.name,
    theme: {
      bannerBackground: "",
      textColor: "",
      textColorTransparent: "",
    },

    teamCount: 1,

    isTournamentAdmin: false,

    membershipStatus: "CAPTAIN",

    bracketId: 1,
    tournamentHasStarted: false,
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
      { code: "teams", text: `Teams (${data.teamCount})` },
    ];
    const tournamentIsOver = false;

    if (data.tournamentHasStarted) {
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
      if (!data.tournamentHasStarted) {
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
      {/* <CheckinActions /> */}
      <div className="tournament__outlet-spacer" />
      {/* TODO: pass context instead of useMatches */}
      <Outlet />
    </div>
  );
}

function MyTeamLink() {
  const data = useLoaderData<TournamentLoaderData>();
  const user = useUser();

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

  if (data.tournamentHasStarted) {
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
