import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId } from "~/features/auth/core/user.server";
import { i18next } from "~/modules/i18n/i18next.server";
import { makeTitle } from "~/utils/strings";
import { allTeams } from "../queries/allTeams.server";
import type { UserWithPlusTier } from "~/db/types";
import { sumArray } from "~/utils/number";

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

    const teamAPlusTierRating = membersToCommonPlusTierRating(teamA.members);
    const teamBPlusTierRating = membersToCommonPlusTierRating(teamB.members);

    // and as tiebreaker teams with a higher plus server tier member first (4 best considered)
    if (teamAPlusTierRating > teamBPlusTierRating) {
      return 1;
    }

    if (teamAPlusTierRating < teamBPlusTierRating) {
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

const membersToCommonPlusTierRating = (
  members: Pick<UserWithPlusTier, "plusTier">[],
) => {
  return sumArray(
    members
      .map((m) => m.plusTier ?? 100)
      .sort((a, b) => a - b)
      .slice(0, 4),
  );
};
