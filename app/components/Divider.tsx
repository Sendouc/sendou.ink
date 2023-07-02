import clsx from "clsx";

export function Divider({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("divider", className)}>{children}</div>;
}
