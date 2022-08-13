import clsx from "clsx";

type LabelProps = Pick<
  React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >,
  "children" | "htmlFor"
> & {
  valueLimits?: {
    current: number;
    max: number;
  };
  required?: boolean;
};

export function Label({
  valueLimits,
  required,
  children,
  htmlFor,
}: LabelProps) {
  return (
    <div className="label__container">
      <label htmlFor={htmlFor}>
        {children} {required && <span className="text-error">*</span>}
      </label>
      {valueLimits ? (
        <div className={clsx("label__value", lengthWarning(valueLimits))}>
          {valueLimits.current}/{valueLimits.max}
        </div>
      ) : null}
    </div>
  );
}

function lengthWarning(valueLimits: NonNullable<LabelProps["valueLimits"]>) {
  if (valueLimits.current >= valueLimits.max) return "error";
  if (valueLimits.current / valueLimits.max >= 0.9) return "warning";

  return;
}
