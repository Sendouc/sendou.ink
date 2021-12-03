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
import { InfoBanner } from "~/components/tournament/InfoBanner";
import {
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { getUser, makeTitle } from "~/utils";
import tournamentStylesUrl from "../../styles/tournament.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tournamentStylesUrl }];
};

export const loader: LoaderFunction = ({ params, context }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  const user = getUser(context);

  return findTournamentByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
    userId: user?.id,
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

  const displayNavLinks =
    !location.pathname.endsWith("register") &&
    !location.pathname.endsWith("manage-roster");

  const navLinks = (() => {
    const result: { code: string; text: string }[] = [
      { code: "overview", text: "Overview" },
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

    return result;
  })();

  return (
    <div className="tournament__container">
      <InfoBanner />
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
