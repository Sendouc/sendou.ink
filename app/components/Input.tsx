import clsx from "clsx";

export function Input({
  name,
  className,
  minLength,
  maxLength,
  leftAddon,
}: {
  name: string;
  className?: string;
  minLength?: number;
  maxLength?: number;
  leftAddon?: string;
}) {
  return (
    <div className={clsx("input-container", className)}>
      {leftAddon ? <div className="input-addon">{leftAddon}</div> : null}
      <input name={name} minLength={minLength} maxLength={maxLength} />
    </div>
  );
}
