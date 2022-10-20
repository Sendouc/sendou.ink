import { WeaponCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import { useObjectDamage } from "~/modules/analyzer";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { type SendouRouteHandle } from "~/utils/remix";

export const handle: SendouRouteHandle = {
  i18n: ["weapons"],
};

export default function ObjectDamagePage() {
  const { mainWeaponId, handleChange, multipliers } = useObjectDamage();

  if (process.env.NODE_ENV !== "development") {
    return <Main>WIP :)</Main>;
  }

  return (
    <Main>
      <WeaponCombobox
        inputName="weapon"
        initialWeaponId={mainWeaponId}
        onChange={(opt) =>
          opt &&
          handleChange({
            newMainWeaponId: Number(opt.value) as MainWeaponId,
          })
        }
        className="w-full-important"
        clearsInputOnFocus
      />
      <pre>{JSON.stringify(multipliers, null, 2)}</pre>
    </Main>
  );
}
