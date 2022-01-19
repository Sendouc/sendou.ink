import * as React from "react";
import { Link } from "remix";

export default function Modal({
  closeUrl,
  title,
  children,
}: {
  closeUrl: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="modal">
      <div>
        <Link to={closeUrl} className="modal-close">
          Close
        </Link>
        <h2>{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}
