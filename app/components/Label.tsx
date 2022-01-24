import clsx from "clsx";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export function Label({ className, ...rest }: LabelProps) {
  return <label className={clsx(className, "label")} {...rest} />;
}
