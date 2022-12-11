import { Switch } from "@headlessui/react";
import clsx from "clsx";

export function Toggle({
  checked,
  setChecked,
  tiny,
  id,
  name,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  tiny?: boolean;
  id?: string;
  name?: string;
}) {
  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      className={clsx("toggle", { checked, tiny })}
      id={id}
      name={name}
      data-testid={id ? `toggle-${id}` : null}
    >
      <span className={clsx("toggle-dot", { checked, tiny })} />
    </Switch>
  );
}
