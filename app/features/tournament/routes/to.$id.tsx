import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import { useTranslation } from "~/hooks/useTranslation";
import { getUser, useUser } from "~/modules/auth";
import { canAdminCalendarTOTools } from "~/permissions";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import type {
  FindTeamsByEventId,
  FindTeamsByEventIdItem,
} from "../queries/findTeamsByEventId.server";
import { findTeamsByEventId } from "../queries/findTeamsByEventId.server";
import { idFromParams } from "../tournament-utils";
import styles from "../tournament.css";

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
  const eventId = idFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(eventId));

  return {
    event,
    tieBreakerMapPool:
      db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
    teams: censorMapPools(findTeamsByEventId(eventId)),
  };

  function censorMapPools(teams: FindTeamsByEventId): FindTeamsByEventId {
    return teams.map((team) =>
      team.members.some(
        (member) => member.userId === user?.id && member.isOwner
      )
        ? team
        : {
            ...team,
            mapPool:
              // can be used to show checkmark in UI if team has submitted
              // the map pool without revealing the contents
              (team.mapPool?.length ?? 0) > 0
                ? ([] as FindTeamsByEventIdItem["mapPool"])
                : undefined,
          }
    );
  }
};

export default function TournamentToolsLayout() {
  const { t } = useTranslation(["tournament"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <SubNav>
        <SubNavLink to="register">Register</SubNavLink>
        <SubNavLink to="teams">
          {t("tournament:tabs.teams", { count: data.teams.length })}
        </SubNavLink>
        {canAdminCalendarTOTools({ user, event: data.event }) && (
          <SubNavLink to="admin">{t("tournament:tabs.admin")}</SubNavLink>
        )}
      </SubNav>
      <Outlet context={data} />
    </Main>
  );
}
