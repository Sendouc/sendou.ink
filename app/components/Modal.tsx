import * as React from "react";
import { Link, useNavigate } from "@remix-run/react";
import { useOnClickOutside } from "~/hooks/common";

const ESC_BUTTON = "Escape";

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

  const navigateBack = React.useCallback(
    () => navigate(closeUrl),
    [closeUrl, navigate]
  );
  useOnClickOutside(ref, navigateBack);

  React.useEffect(() => {
    function handleEscButtonPress(e: KeyboardEvent) {
      if (e.key === ESC_BUTTON) {
        navigateBack();
      }
    }

    document.addEventListener("keydown", handleEscButtonPress);
    return () => {
      document.removeEventListener("keydown", handleEscButtonPress);
    };
  });

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
