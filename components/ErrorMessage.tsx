import { Show } from "solid-js";
import s from "../styles/ErrorMessage.module.css";

export function ErrorMessage(p: { error?: string }) {
  return (
    <Show when={p.error}>
      <div class={s.container}>{p.error}</div>
    </Show>
  );
}
