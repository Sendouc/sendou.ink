import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import { averageAbilityPoints } from "../queries/averageAbilityPoints.server";
import { abilityPointCountsToAverages } from "../build-stats-utils";

export const loader = ({ params }: LoaderArgs) => {
  const weaponId = weaponNameSlugToId(params["slug"]);

  return abilityPointCountsToAverages({
    allAbilities: averageAbilityPoints(),
    weaponAbilities: averageAbilityPoints(weaponId),
  });
};

export default function BuildStatsPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

  return <Main>hello</Main>;
}
