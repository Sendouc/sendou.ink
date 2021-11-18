import { createSignal } from "solid-js";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import s from "../styles/ActionSection.module.css";

export function ActionSection() {
  const [expanded, setExpanded] = createSignal(true);

  const open = () => setExpanded(true);
  const close = () => setExpanded(false);
  const handleSpaceBarClick = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      open();
    }
  };

  return (
    <div
      class={s.container}
      classList={{ [s.active]: expanded() }}
      onClick={open}
      onKeyDown={handleSpaceBarClick}
      tabindex={expanded() ? undefined : "0"}
    >
      <div class={s.header}>Register now</div>
      {expanded() && (
        <div class={s.content}>
          <Input id="team-name" labelText="Team name" />
          <div class={s.buttonsContainer}>
            <Button type="submit">Submit</Button>
            <Button variant="outlined" type="button" onClick={close}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
