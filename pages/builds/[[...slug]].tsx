import { Box, Wrap, WrapItem } from "@chakra-ui/core";
import { t } from "@lingui/macro";
import { Ability } from "@prisma/client";
import BuildCard from "components/builds/BuildCard";
import BuildFilters from "components/builds/BuildFilters";
import Breadcrumbs from "components/common/Breadcrumbs";
import WeaponSelector from "components/common/WeaponSelector";
import { weaponToCode } from "lib/lists/weaponCodes";
import { GetBuildsByWeaponData } from "prisma/queries/getBuildsByWeapon";
import { useState } from "react";
import useSWR from "swr";

interface BuildFilter {
  type: "AT_LEAST" | "AT_MOST" | "HAS" | "DOES_NOT_HAVE";
  abilityPoints: number;
  ability: Ability;
}

const BuildsPage = () => {
  const [weapon, setWeapon] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<BuildFilter[]>([]);

  const { data = [] } = useSWR<GetBuildsByWeaponData>(() => {
    if (!weapon) return null;

    const key = weapon as keyof typeof weaponToCode;
    return `/api/builds/${weaponToCode[key]}`;
  });

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Builds` }]} />
      <WeaponSelector value={weapon} onChange={setWeapon} excludeAlt isHeader />
      <Box mt={10}>
        <BuildFilters filters={filters} setFilters={setFilters} />
      </Box>
      <Wrap pt={16} justifyContent="center" spacing={8}>
        {data.flatMap((buildArray) => {
          const firstBuild = buildArray[0];
          if (expanded.has(firstBuild.userId)) {
            return buildArray.map((build) => (
              <WrapItem key={build.id}>
                <BuildCard build={build} />
              </WrapItem>
            ));
          }

          return (
            <WrapItem key={firstBuild.id}>
              <BuildCard
                build={firstBuild}
                otherBuildCount={buildArray.length - 1}
                onShowAllByUser={() =>
                  setExpanded(new Set([...expanded, firstBuild.userId]))
                }
              />
            </WrapItem>
          );
        })}
      </Wrap>
    </>
  );
};

export default BuildsPage;
