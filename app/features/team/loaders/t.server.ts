import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId } from "~/features/auth/core/user.server";
import { i18next } from "~/modules/i18n/i18next.server";
import { makeTitle } from "~/utils/strings";
import { allTeams } from "../queries/allTeams.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserId(request);
  const t = await i18next.getFixedT(request);

  const teams = allTeams().sort((teamA, teamB) => {
    // show own team first always
    if (user && teamA.members.some((m) => m.id === user.id)) {
      return -1;
    }

    if (user && teamB.members.some((m) => m.id === user.id)) {
      return 1;
    }

    // then full teams
    if (teamA.members.length >= 4 && teamB.members.length < 4) {
      return -1;
    }

    if (teamA.members.length < 4 && teamB.members.length >= 4) {
      return 1;
    }

    // and as tiebreaker teams with a higher plus server tier member first
    const lowestATeamPlusTier = Math.min(
      ...teamA.members.map((m) => m.plusTier ?? Infinity),
    );
    const lowestBTeamPlusTier = Math.min(
      ...teamB.members.map((m) => m.plusTier ?? Infinity),
    );

    if (lowestATeamPlusTier > lowestBTeamPlusTier) {
      return 1;
    }

    if (lowestATeamPlusTier < lowestBTeamPlusTier) {
      return -1;
    }

    return 0;
  });

  return {
    title: makeTitle(t("pages.t")),
    teams,
    isMemberOfTeam: !user
      ? false
      : teams.some((t) => t.members.some((m) => m.id === user.id)),
  };
};
