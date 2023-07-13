import { Switch } from "@headlessui/react";
import clsx from "clsx";

export function Toggle({
  checked,
  setChecked,
  tiny,
  id,
  name,
  disabled,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  tiny?: boolean;
  id?: string;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      className={clsx("toggle", { checked, tiny })}
      id={id}
      name={name}
      data-testid={id ? `toggle-${id}` : null}
      disabled={disabled}
    >
      <span className={clsx("toggle-dot", { checked, tiny })} />
    </Switch>
  );
}
