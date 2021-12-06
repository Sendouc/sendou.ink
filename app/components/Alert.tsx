import classNames from "classnames";
import { AlertIcon } from "./icons/Alert";

export function Alert(props: {
  children: React.ReactNode;
  type: "warning" | "info";
  className?: string;
  "data-cy"?: string;
}) {
  return (
    <div
      data-type={props.type}
      className={classNames("alert", props.className)}
      data-cy={props["data-cy"]}
    >
      <AlertIcon />
      {props.children}
    </div>
  );
}
