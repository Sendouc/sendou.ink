import clsx from "clsx";

export function Input({
  name,
  className,
  minLength,
  maxLength,
  defaultValue,
  leftAddon,
  icon,
  pattern,
  list,
  "data-cy": dataCy,
  value,
  onChange,
}: {
  name?: string;
  className?: string;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  leftAddon?: string;
  icon?: React.ReactNode;
  pattern?: string;
  list?: string;
  "data-cy"?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        value={value}
        onChange={onChange}
      />
      {icon}
    </div>
  );
}
