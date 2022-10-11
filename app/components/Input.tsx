import clsx from "clsx";

export function Input({
  name,
  className,
  minLength,
  maxLength,
  defaultValue,
  leftAddon,
  pattern,
  list,
  "data-cy": dataCy,
}: {
  name: string;
  className?: string;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  leftAddon?: string;
  pattern?: string;
  list?: string;
  "data-cy"?: string;
}) {
  return (
    <div className={clsx("input-container", className)}>
      {leftAddon ? <div className="input-addon">{leftAddon}</div> : null}
      <input
        name={name}
        minLength={minLength}
        maxLength={maxLength}
        defaultValue={defaultValue}
        pattern={pattern}
        list={list}
        data-cy={dataCy}
      />
    </div>
  );
}
