// TODO: 404 page that shows other tournaments by the organization

// import {
//   ActionFunction,
//   LinksFunction,
//   LoaderFunction,
//   MetaFunction,
// } from "@remix-run/node";
// import { Outlet, ShouldReloadFunction, useLoaderData } from "@remix-run/react";
// import invariant from "tiny-invariant";
// import { SubNav, SubNavLink } from "~/components/SubNav";
// import { CheckinActions } from "~/components/tournament/CheckinActions";
// import { PAGE_TITLE_KEY } from "~/constants";
// import { tournamentHasStarted } from "~/core/tournament/utils";
// import { isTournamentAdmin } from "~/core/tournament/validators";
// import { useUser } from "~/hooks/common";
// import {
//   checkIn,
//   findTournamentByNameForUrl,
//   FindTournamentByNameForUrlI,
// } from "~/services/tournament";
// import { makeTitle, MyCSSProperties, requireUser } from "~/utils";
import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  type ShouldReloadFunction,
  useLoaderData,
  Outlet,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { requireUser, useUser } from "~/modules/auth";
import { tournamentHasStarted } from "~/modules/tournament/utils";
import tournamentStylesUrl from "~/styles/tournament.css";
import { parseRequestFormData } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { id } from "~/utils/zod";
import { CheckinActions } from "./components/CheckinActions";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tournamentStylesUrl }];
};

const tournamentActionSchema = z.object({
  _action: z.literal("CHECK_IN"),
  teamId: id,
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: tournamentActionSchema,
  });
  const user = await requireUser(request);

  switch (data._action) {
    case "CHECK_IN": {
      // xxx: validate can check in (check previous checkIn function implementation)

      // xxx: checkIn
      // await checkIn({ teamId: data.teamId, userId: user.id });
      break;
    }
    default: {
      assertUnreachable(data._action);
    }
  }
  return new Response(undefined, { status: 200 });
};

export const loader = async ({ params }: LoaderArgs) => {
  invariant(
    typeof params["identifier"] === "string",
    "Expected params.identifier to be string"
  );

  // xxx: findTournamentByNameForUrl
  // const tournament = await findTournamentByNameForUrl({
  //   organizationNameForUrl: params.organization,
  //   tournamentNameForUrl: params.tournament,
  // });

  return {
    rounds: [],
    // [PAGE_TITLE_KEY]: tournament.name,
  };
};

// xxx:
// export const meta: MetaFunction = (props) => {
//   const data = props.data as SerializeFrom<typeof loader> | null;

//   return {
//     title: makeTitle(data?.name),
//   };
// };

export const unstable_shouldReload: ShouldReloadFunction = (data) => {
  const action = data.submission?.formData.get("_action");
  if (!action) return true;
  return !["REPORT_SCORE", "UNDO_REPORT_SCORE"].includes(String(action));
};

export default function TournamentPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  const navLinks = (() => {
    const result: { code: string; text: string }[] = [
      { code: "", text: "Overview" },
      { code: "map-pool", text: "Map Pool" },
      { code: "teams", text: `Teams (${data.teams.length})` },
    ];
    const tournamentIsOver = false;

    if (tournamentHasStarted(data.brackets)) {
      result.push({ code: `bracket/${data.brackets[0].id}`, text: "Bracket" });

      // TODO: add streams page
      // eslint-disable-next-line no-constant-condition
      if (!tournamentIsOver && false) {
        result.push({ code: "streams", text: "Streams (4)" });
      }
    }

    const thereIsABracketToStart = data.brackets.some(
      (bracket) => bracket.rounds.length === 0
    );

    if (isTournamentAdmin({ userId: user?.id, organization: data.organizer })) {
      result.push({
        code: "manage",
        text: "Controls",
      });
      if (!tournamentHasStarted(data.brackets)) {
        result.push({ code: "seeds", text: "Seeds" });
      }
      if (thereIsABracketToStart) result.push({ code: "start", text: "Start" });
    }

    return result;
  })();

  const tournamentContainerStyle: MyCSSProperties = {
    "--tournaments-bg": data.bannerBackground,
    "--tournaments-text": data.CSSProperties.text,
    "--tournaments-text-transparent": data.CSSProperties.textTransparent,
  };

  return (
    <div className="tournament__container" style={tournamentContainerStyle}>
      <SubNav>
        {navLinks.map((link) => (
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
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  const isAlreadyInATeamButNotCaptain = data.teams
    .flatMap((team) => team.members)
    .filter(({ captain }) => !captain)
    .some(({ member }) => member.id === user?.id);
  if (isAlreadyInATeamButNotCaptain) return null;

  const alreadyRegistered = data.teams
    .flatMap((team) => team.members)
    .some(({ member }) => member.id === user?.id);
  if (alreadyRegistered) {
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

  if (tournamentHasStarted(data.brackets)) {
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
