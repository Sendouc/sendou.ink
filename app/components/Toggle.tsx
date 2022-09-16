import { Switch } from "@headlessui/react";
import clsx from "clsx";

export function Toggle({
  checked,
  setChecked,
  tiny,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  tiny?: boolean;
}) {
  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      className={clsx("toggle", { checked, tiny })}
    >
      <span className={clsx("toggle-dot", { checked, tiny })} />
    </Switch>
  );
}
