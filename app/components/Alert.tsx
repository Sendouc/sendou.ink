import classNames from "classnames";
import { AlertIcon } from "./icons/Alert";
import { SuccessIcon } from "./icons/Success";

// TODO: should flex-dir column on mobile
export function Alert(props: {
  children: React.ReactNode;
  type: "warning" | "info" | "success";
  className?: string;
  rightAction?: React.ReactNode;
  "data-cy"?: string;
}) {
  return (
    <div
      data-type={props.type}
      className={classNames("alert", props.className)}
      data-cy={props["data-cy"]}
    >
      {(props.type === "warning" || props.type === "info") && <AlertIcon />}
      {props.type === "success" && <SuccessIcon />}
      {props.children}
      {props.rightAction}
    </div>
  );
}
