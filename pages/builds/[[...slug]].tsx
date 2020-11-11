import { t } from "@lingui/macro";
import BuildCard from "components/builds/BuildCard";
import Breadcrumbs from "components/common/Breadcrumbs";
import WeaponSelector from "components/common/WeaponSelector";
import { weaponToCode } from "lib/lists/weaponCodes";
import { GetBuildsByWeaponData } from "prisma/queries/getBuildsByWeapon";
import { useState } from "react";
import useSWR from "swr";

const BuildsPage = () => {
  const [weapon, setWeapon] = useState("");

  const { data = [] } = useSWR<GetBuildsByWeaponData>(() => {
    if (!weapon) return null;

    const key = weapon as keyof typeof weaponToCode;
    return `/api/builds/${weaponToCode[key]}`;
  });

  console.log({ data });

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Builds` }]} />
      <WeaponSelector value={weapon} onChange={setWeapon} excludeAlt isHeader />
      {data.map((build) => (
        <BuildCard build={build} />
      ))}
    </>
  );
};

export default BuildsPage;
