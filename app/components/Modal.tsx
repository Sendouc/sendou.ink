import * as React from "react";
import { Link, useNavigate } from "remix";
import { useOnClickOutside } from "~/hooks/common";

export default function Modal({
  closeUrl,
  title,
  children,
}: {
  closeUrl: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const ref = React.useRef<HTMLDivElement>(null);

  const useOnClickOutsideHandler = React.useCallback(
    () => navigate(closeUrl),
    [closeUrl]
  );
  useOnClickOutside(ref, useOnClickOutsideHandler);

  return (
    <div className="modal">
      <div ref={ref}>
        <Link to={closeUrl} className="modal-close">
          Close
        </Link>
        <h2>{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}
