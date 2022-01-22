// TODO: 404 page that shows other tournaments by the organization

import {
  LinksFunction,
  LoaderFunction,
  ActionFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
  ShouldReloadFunction,
} from "remix";
import invariant from "tiny-invariant";
import { AdminIcon } from "~/components/icons/Admin";
import { CheckinActions } from "~/components/tournament/CheckinActions";
import { InfoBanner } from "~/components/tournament/InfoBanner";
import { tournamentHasStarted } from "~/core/tournament/utils";
import {
  checkIn,
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { makeTitle, requireUser } from "~/utils";
import type { MyCSSProperties } from "~/utils";
import { useUser } from "~/hooks/common";
import tournamentStylesUrl from "../../styles/tournament.css";
import * as React from "react";
import { isTournamentAdmin } from "~/core/tournament/validators";

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

export const loader: LoaderFunction = ({ params }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  return findTournamentByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });
};

export const meta: MetaFunction = (props) => {
  const data = props.data as FindTournamentByNameForUrlI | undefined;

  return {
    title: makeTitle(data?.name),
    // TODO: description, image?
    //description: data.description ?? undefined,
  };
};

export const unstable_shouldReload: ShouldReloadFunction = (data) => {
  const action = data.submission?.formData.get("_action");
  if (!action) return true;
  return !["REPORT_SCORE", "UNDO_REPORT_SCORE"].includes(String(action));
};

export default function TournamentPage() {
  const data = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();

  const navLinks = (() => {
    const result: { code: string; text: string; icon?: React.ReactNode }[] = [
      { code: "", text: "Overview" },
      { code: "map-pool", text: "Map Pool" },
      { code: "teams", text: `Teams (${data.teams.length})` },
    ];
    const tournamentIsOver = false;

    if (tournamentHasStarted(data.brackets)) {
      result.push({ code: `bracket/${data.brackets[0].id}`, text: "Bracket" });
      if (!tournamentIsOver) {
        result.push({ code: "streams", text: "Streams (4)" });
      }
    }

    const thereIsABracketToStart = data.brackets.some(
      (bracket) => bracket.rounds.length === 0
    );

    if (isTournamentAdmin({ userId: user?.id, organization: data.organizer })) {
      result.push({
        code: "manage",
        // TODO: figure out a good name
        text: "Controls",
        icon: <AdminIcon />,
      });
      if (!tournamentHasStarted(data.brackets)) {
        result.push({ code: "seeds", text: "Seeds", icon: <AdminIcon /> });
      }
      if (thereIsABracketToStart)
        result.push({ code: "start", text: "Start", icon: <AdminIcon /> });
    }

    return result;
  })();

  const tournamentContainerStyle: MyCSSProperties = {
    "--tournaments-bg": data.bannerBackground,
    "--tournaments-text": data.CSSProperties.text,
    "--tournaments-text-transparent": data.CSSProperties.textTransparent,
  };

  const linksContainerStyle: MyCSSProperties = {
    "--tabs-count": navLinks.length,
  };

  return (
    <div className="tournament__container" style={tournamentContainerStyle}>
      <InfoBanner />
      <div className="tournament__container__spacer" />
      <div className="tournament__links-overflower">
        <div className="tournament__links-border">
          <div
            style={linksContainerStyle}
            className="tournament__links-container"
          >
            {navLinks.map(({ code, text, icon }) => (
              <TournamentNavLink
                key={code}
                code={code}
                icon={icon}
                text={text}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="tournament__container__spacer" />
      <CheckinActions />
      <div className="tournament__outlet-spacer" />
      {/* TODO: pass context instead of useMatches */}
      <Outlet />
    </div>
  );
}

function TournamentNavLink({
  code,
  icon,
  text,
}: {
  code: string;
  icon: React.ReactNode;
  text: string;
}) {
  const ref = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    if (!ref.current?.className.includes("active")) return;
    ref.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  return (
    <NavLink
      className="tournament__nav-link"
      to={code}
      data-cy={`${code}-nav-link`}
      prefetch="intent"
      end
      ref={ref}
    >
      {icon} {text}
    </NavLink>
  );
}
