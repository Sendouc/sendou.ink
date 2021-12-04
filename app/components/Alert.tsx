import { AlertIcon } from "./icons/Alert";

export function Alert(props: {
  children: React.ReactNode;
  type: "warning";
  "data-cy"?: string;
}) {
  return (
    <div data-type={props.type} className="alert" data-cy={props["data-cy"]}>
      <AlertIcon />
      {props.children}
    </div>
  );
}
