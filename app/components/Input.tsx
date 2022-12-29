import clsx from "clsx";

export function Input({
  name,
  id,
  className,
  minLength,
  maxLength,
  required,
  defaultValue,
  leftAddon,
  icon,
  pattern,
  list,
  "data-cy": dataCy,
  "aria-label": ariaLabel,
  value,
  placeholder,
  onChange,
}: {
  name?: string;
  id?: string;
  className?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  defaultValue?: string;
  leftAddon?: string;
  icon?: React.ReactNode;
  pattern?: string;
  list?: string;
  "data-cy"?: string;
  "aria-label"?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={clsx("input-container", className)}>
      {leftAddon ? <div className="input-addon">{leftAddon}</div> : null}
      <input
        name={name}
        id={id}
        minLength={minLength}
        maxLength={maxLength}
        defaultValue={defaultValue}
        pattern={pattern}
        list={list}
        data-cy={dataCy}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        required={required}
        placeholder={placeholder}
      />
      {icon}
    </div>
  );
}
