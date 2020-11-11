import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import WeaponSelector from "components/common/WeaponSelector";
import { weaponToCode } from "lib/lists/weaponCodes";
import { useState } from "react";
import useSWR from "swr";

const BuildsPage = () => {
  const [weapon, setWeapon] = useState("");

  const { data } = useSWR(() => {
    if (!weapon) return null;

    const key = weapon as keyof typeof weaponToCode;
    return `/api/builds/${weaponToCode[key]}`;
  });

  console.log({ data });

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Builds` }]} />
      <WeaponSelector value={weapon} onChange={setWeapon} excludeAlt />
    </>
  );
};

export default BuildsPage;
