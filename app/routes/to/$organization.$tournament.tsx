// TODO: 404 page that shows other tournaments by the organization

import {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { ActionSection } from "~/components/tournament/ActionSection";
import { InfoBanner } from "~/components/tournament/InfoBanner";
import { isTournamentAdmin } from "~/core/tournament/permissions";
import {
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { makeTitle } from "~/utils";
import { useUser } from "~/utils/hooks";
import tournamentStylesUrl from "../../styles/tournament.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tournamentStylesUrl }];
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
    //description: data.description ?? undefined,
  };
};

export default function TournamentPage() {
  const data = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();

  const navLinks = (() => {
    const result: { code: string; text: string }[] = [
      { code: "", text: "Overview" },
      { code: "map-pool", text: "Map Pool" },
      { code: "teams", text: `Teams (${data.teams.length})` },
    ];
    const tournamentIsHappening = false;
    const tournamentIsOver = false;

    if (tournamentIsHappening) {
      result.push({ code: "bracket", text: "Bracket" });
      if (!tournamentIsOver) {
        result.push({ code: "streams", text: "Streams (4)" });
      }
    }

    // TODO: maybe some visual effect for admin only tabs?
    if (isTournamentAdmin({ userId: user?.id, organization: data.organizer })) {
      result.push({ code: "seeds", text: "Seeds" });
      result.push({ code: "edit", text: "Edit" });
      result.push({ code: "start", text: "Start" });
    }

    return result;
  })();

  return (
    <div
      className="tournament__container"
      style={
        {
          "--tournaments-background": data.bannerBackground,
          "--tournaments-text": data.CSSProperties.text,
          "--tournaments-text-transparent": data.CSSProperties.textTransparent,
          // todo: could make a TS helper type for this that checks for leading --
        } as Record<string, string>
      }
    >
      <InfoBanner />
      <div className="tournament__container__spacer" />
      <div className="tournament__links-overflower">
        <div className="tournament__links-border">
          <div
            style={{ "--tabs-count": navLinks.length } as any}
            className="tournament__links-container"
          >
            {navLinks.map(({ code, text }) => (
              // TODO: on mobile keep the active link in center
              <NavLink
                key={code}
                className="tournament__nav-link"
                to={code}
                data-cy={`${code}-nav-link`}
                prefetch="intent"
                end
              >
                <span>{text}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      <div className="tournament__container__spacer" />
      <ActionSection />
      <div className="tournament__outlet-spacer" />
      {/* TODO: pass context instead of useMatches */}
      <Outlet />
    </div>
  );
}
