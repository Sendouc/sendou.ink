import classNames from "classnames";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export function Label({ className, ...rest }: LabelProps) {
  return <label className={classNames(className, "label")} {...rest} />;
}
