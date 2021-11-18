import type { JSX } from "solid-js";
import s from "../styles/Input.module.css";

export function Input(
  p: JSX.InputHTMLAttributes<HTMLInputElement> & { labelText?: string }
) {
  return (
    <>
      {p.labelText && (
        <label class={s.label} htmlFor={p.id}>
          {p.labelText}
        </label>
      )}
      <input class={s.input} {...p} />
    </>
  );
}
