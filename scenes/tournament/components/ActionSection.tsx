import { createSignal } from "solid-js";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import s from "../styles/ActionSection.module.css";

export function ActionSection() {
  const [expanded, setExpanded] = createSignal(true);

  return (
    <div
      class={s.container}
      classList={{ [s.active]: expanded() }}
      onClick={() => setExpanded(true)}
      tabindex={!expanded() ? "0" : undefined}
      role={!expanded() ? "button" : undefined}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setExpanded(true);
        }
      }}
    >
      <div class={s.header}>Register now</div>
      {expanded() && (
        <div class={s.content} onKeyDown={(e) => e.stopPropagation()}>
          <form>
            <Input
              id="team-name"
              labelText="Team name"
              required
              minLength={2}
              maxLength={40}
            />
            <div class={s.buttonsContainer}>
              <Button type="submit">Submit</Button>
              <Button
                variant="outlined"
                type="button"
                onClick={() => setExpanded(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
