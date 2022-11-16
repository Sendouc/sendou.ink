import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import type {
  FindTeamsByEventId,
  FindTeamsByEventIdItem,
} from "~/db/models/tournaments/queries.server";
import type { TournamentTeam } from "~/db/types";
import { getUser, useUser } from "~/modules/auth";
import { canAdminCalendarTOTools } from "~/permissions";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { findOwnedTeam } from "~/utils/tournaments";
import styles from "~/styles/tournament.css";
import { makeTitle } from "~/utils/strings";
import { useTranslation } from "~/hooks/useTranslation";
import type { Unpacked } from "~/utils/types";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return {};

  return {
    title: makeTitle(data.event.name),
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["tournament"],
};

export type TournamentToolsTeam = Unpacked<TournamentToolsLoaderData["teams"]>;
export type TournamentToolsLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  const eventId = params["identifier"]!;

  const event = notFoundIfFalsy(db.tournaments.findByIdentifier(eventId));
  const teams = db.tournaments.findTeamsByEventId(event.id);

  return {
    event,
    tieBreakerMapPool:
      db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
    teams: event.isBeforeStart ? censorMapPools({ teams }) : teams,
    ownTeam: findOwnedTeam({ userId: user?.id, teams }),
  };
};

function censorMapPools({
  teams,
  ownTeamId,
}: {
  teams: FindTeamsByEventId;
  ownTeamId?: TournamentTeam["id"];
}) {
  return teams.map((team) =>
    team.id === ownTeamId
      ? team
      : {
          ...team,
          mapPool:
            // can be used to show checkmark in UI if team has submitted
            // the map pool without revealing the contents
            team.mapPool.length > 0
              ? ([] as FindTeamsByEventIdItem["mapPool"])
              : undefined,
        }
  );
}

export default function TournamentToolsLayout() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <SubNav>
        <SubNavLink to="">{t("tournament:tabs.info")}</SubNavLink>
        <SubNavLink to="teams">
          {t("tournament:tabs.teams", { count: data.teams.length })}
        </SubNavLink>
        {canAdminCalendarTOTools({ user, event: data.event }) && (
          <SubNavLink to="admin">{t("tournament:tabs.admin")}</SubNavLink>
        )}
      </SubNav>
      <Outlet context={data} />
    </>
  );
}
