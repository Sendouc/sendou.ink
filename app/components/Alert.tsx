import { AlertIcon } from "./icons/Alert";

export function Alert({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "warning";
}) {
  return (
    <div data-type={type} className="alert">
      <AlertIcon />
      {children}
    </div>
  );
}
