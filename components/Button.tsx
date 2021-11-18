import type { JSX } from "solid-js";
import s from "../styles/Button.module.css";

export function Button(
  p: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outlined" }
) {
  return (
    <button
      class={s.button}
      classList={{ [s.outlined]: p.variant === "outlined" }}
      {...p}
    />
  );
}
