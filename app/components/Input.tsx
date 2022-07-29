import clsx from "clsx";

export function Input({
  name,
  leftAddon,
  className,
}: {
  name: string;
  leftAddon?: string;
  className?: string;
}) {
  return (
    <div className={clsx("input-container", className)}>
      {leftAddon ? <div className="input-addon">{leftAddon}</div> : null}
      <input name={name} />
    </div>
  );
}
