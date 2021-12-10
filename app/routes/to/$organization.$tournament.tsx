// TODO: 404 page that shows other tournaments by the organization

import {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
} from "remix";
import invariant from "tiny-invariant";
import { ActionSection } from "~/components/tournament/ActionSection";
import { InfoBanner } from "~/components/tournament/InfoBanner";
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
  const location = useLocation();
  const user = useUser();

  const displayNavLinks = ["register", "manage-roster", "join-team"].every(
    (urlPart) => !location.pathname.endsWith(urlPart)
  );

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

    const isAdmin = data.organizer.ownerId === user?.id;

    if (isAdmin) {
      result.push({ code: "admin", text: "Admin" });
    }

    return result;
  })();

  return (
    <div
      className="tournament__container"
      style={
        {
          "--tournaments-background": data.bannerBackground,
          // TODO: do this on backend
          "--tournaments-text": `hsl(${data.bannerTextHSLArgs})`,
          // TODO: and this
          "--tournaments-text-transparent": `hsla(${data.bannerTextHSLArgs}, 0.3)`,
        } as Record<string, string>
      }
    >
      <InfoBanner />
      <ActionSection />
      <div className="tournament__container__spacer" />
      {displayNavLinks && (
        <div
          style={{ "--tabs-count": navLinks.length } as any}
          className="tournament__links-container"
        >
          {navLinks.map(({ code, text }) => (
            <NavLink
              key={code}
              className="tournament__nav-link"
              to={code}
              data-cy={`${code}-nav-link`}
              prefetch="intent"
              end
            >
              {text}
            </NavLink>
          ))}
        </div>
      )}
      <Outlet />
    </div>
  );
}
